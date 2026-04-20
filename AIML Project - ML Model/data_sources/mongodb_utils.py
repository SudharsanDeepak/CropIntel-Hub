"""MongoDB write helpers for bulk refresh jobs."""

import time
from data_sources.price_catalog import infer_category, infer_price_range


def _to_float(value, default):
    try:
        return float(value)
    except Exception:
        return float(default)


def sanitize_market_record(record):
    """Normalize a market record so unrealistic values are not written to MongoDB."""
    sanitized = dict(record)
    product = str(sanitized.get("product", "")).strip()

    if not product:
        return sanitized

    min_price, max_price = infer_price_range(product)
    midpoint = (min_price + max_price) / 2

    price = _to_float(sanitized.get("price", midpoint), midpoint)
    if price < min_price or price > max_price:
        price = midpoint
    sanitized["price"] = round(price, 2)

    if "predicted_price" in sanitized:
        predicted_price = _to_float(sanitized.get("predicted_price", sanitized["price"]), sanitized["price"])
        if predicted_price < min_price or predicted_price > max_price:
            predicted_price = sanitized["price"]
        sanitized["predicted_price"] = round(predicted_price, 2)

    sanitized["category"] = infer_category(product)

    if not sanitized.get("unit"):
        sanitized["unit"] = "kg"

    return sanitized


def replace_collection_with_batches(
    collection,
    records,
    batch_size=100,
    delete_filter=None,
    retries=3,
    preserve_missing_products=True,
    product_field="product",
):
    """
    Replace matching records by deleting only incoming products and inserting in batches.

    When preserve_missing_products=True, products that are not present in incoming
    records are left untouched in MongoDB.

    This keeps large refresh jobs from timing out on Atlas connections.
    """
    if not records:
        return 0

    sanitized_records = [sanitize_market_record(item) for item in records]

    if delete_filter is not None:
        collection.delete_many(delete_filter)
    elif preserve_missing_products:
        products_to_replace = sorted(
            {
                str(item.get(product_field, "")).strip()
                for item in sanitized_records
                if str(item.get(product_field, "")).strip()
            }
        )
        if products_to_replace:
            collection.delete_many({product_field: {"$in": products_to_replace}})
    else:
        collection.delete_many({})

    saved_count = 0
    total_records = len(records)

    for start in range(0, total_records, batch_size):
        batch = sanitized_records[start:start + batch_size]
        last_error = None

        for attempt in range(retries):
            try:
                result = collection.insert_many(batch, ordered=False)
                saved_count += len(result.inserted_ids)
                last_error = None
                break
            except Exception as error:
                last_error = error
                if attempt < retries - 1:
                    time.sleep(1 + attempt)

        if last_error is not None:
            raise last_error

    return saved_count