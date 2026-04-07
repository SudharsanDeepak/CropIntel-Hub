"""MongoDB write helpers for bulk refresh jobs."""

import time


def replace_collection_with_batches(collection, records, batch_size=100, delete_filter=None, retries=3):
    """
    Replace a collection by deleting matching documents and inserting records in batches.

    This keeps large refresh jobs from timing out on Atlas connections.
    """
    if not records:
        return 0

    collection.delete_many(delete_filter or {})

    saved_count = 0
    total_records = len(records)

    for start in range(0, total_records, batch_size):
        batch = records[start:start + batch_size]
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