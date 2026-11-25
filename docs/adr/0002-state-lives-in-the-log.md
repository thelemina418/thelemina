# A Work's State is derived from its Log entries

A Work has no `state` field. Its State is whatever its most recent State-changing Log entry says (a Seed if there is none). Changing a Work's State is a public event, so the change is itself a Log entry: it appears in the log and the RSS feed, carries its own date and (for On ice) its Waiting on note, and the Work's history is exactly its Log. Storing State on the Work as well would allow the two to disagree.
