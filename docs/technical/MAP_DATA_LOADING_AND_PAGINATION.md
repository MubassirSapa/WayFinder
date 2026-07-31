# Map Data Loading and Pagination

This document explains how Wayfinder loads floor data, the current pagination
limitation, and how the loading process should be improved.

## What data is loaded for a floor?

Opening a floor in the map editor requires four groups of data:

1. The floor settings
2. Map objects, such as rooms, walls, doors, and elevators
3. Navigation nodes
4. Path edges connecting the navigation nodes

```text
Floor
  |
  +-- Map objects
  +-- Navigation nodes
  +-- Path edges
```

The floor settings include information such as its name, dimensions, scale,
status, and reference-image settings.

## How editor data is stored in the database

The final map is not stored as a screenshot. The database stores the numbers,
properties, and relationships needed to draw the map again.

```text
User edits the map
        |
        v
JavaScript data in the browser
        |
        v
User presses Save Changes
        |
        v
Next.js sends the data to a server action
        |
        v
Server converts editor fields into Payload fields
        |
        v
Payload validates the data
        |
        v
SQLite stores the database records
```

### Step 1: The browser holds temporary editor data

The Zustand store holds the map data while the editor is open. A room may look
like this in browser memory:

```ts
{
  id: "45",
  floorId: "3",
  name: "Room 101",
  type: "room",
  x: 200,
  y: 150,
  width: 180,
  height: 100,
  rotation: 0,
}
```

These are plain JavaScript values. The `x` and `y` values store the object's
position on the floor. The `width`, `height`, and `rotation` values describe its
appearance.

### Step 2: Editing changes the browser data

Dragging the room changes its coordinates in Zustand immediately:

```text
Before dragging: x = 200, y = 150
After dragging:  x = 350, y = 220
```

The editor also marks the room as changed:

```ts
_dirty: true
```

This means the browser has a change that is not yet stored in the database.
Refreshing the page before saving can lose that change.

### Step 3: Save Changes sends serializable data

When the user presses **Save Changes**, the editor finds every new or changed
record. It removes browser-only fields such as:

- `_dirty`;
- `_clientId`;
- temporary local IDs where appropriate.

The browser then calls a Next.js server action with serializable values. These
include strings, numbers, booleans, arrays, plain objects, and `null`.

Conceptually, an update sent to the server looks like:

```json
{
  "id": "45",
  "x": 350,
  "y": 220,
  "width": 180,
  "height": 100
}
```

Functions, React components, and the visible screen are not sent to the
database.

### Step 4: The server converts editor fields

The editor uses convenient relationship names:

```text
floorId
objectId
fromNodeId
toNodeId
```

The server adapters convert them into the fields used by Payload:

```text
floorId    -> floor
objectId   -> object
fromNodeId -> fromNode
toNodeId   -> toNode
```

For example:

```ts
// Editor data
{ floorId: "3", objectId: "45" }

// Payload data
{ floor: 3, object: 45 }
```

The relationship IDs become numbers because the current Payload and SQLite
configuration uses numeric record IDs.

### Step 5: Payload validates and stores the data

Payload checks the collection definition before writing anything. For example,
it checks that positions are numbers and that relationships point to the
correct collections.

Payload then stores the records in SQLite. Conceptually, map objects become
rows like these:

| ID | Floor | Name | Type | X | Y | Width | Height |
| ---: | ---: | --- | --- | ---: | ---: | ---: | ---: |
| 45 | 3 | Room 101 | room | 350 | 220 | 180 | 100 |
| 46 | 3 | Room 102 | room | 600 | 220 | 180 | 100 |

Navigation nodes and path edges are stored separately:

```text
Map object 45
     |
     v
Navigation node 70 ----- path edge 90 ----- Navigation node 71
```

An edge record stores the IDs of its two connected nodes, its distance, its
type, and its accessibility settings. These relationships allow the app to
rebuild the navigation graph.

### Step 6: New records receive database IDs

A new editor item begins with a temporary ID:

```text
temp_object_123
```

After Payload creates the record, it returns a real database ID:

```text
temp_object_123 -> 45
```

The editor replaces the temporary ID with the real one. Records are saved in
this order:

```text
Floor -> Map objects -> Navigation nodes -> Path edges
```

The order is important because nodes can refer to objects, and edges refer to
nodes. A related record needs the real ID of the record created before it.

### Step 7: Loading reverses the conversion

Opening the editor performs the reverse process:

```text
SQLite database
       |
       v
Payload reads the records
       |
       v
Server adapters normalize the fields
       |
       v
Next.js sends the data to the browser
       |
       v
Zustand stores the editor data
       |
       v
The map is drawn from the saved positions and properties
```

For example, the server changes Payload relationship fields back into editor
fields:

```ts
// Payload data
{ floor: 3, object: 45 }

// Editor data
{ floorId: "3", objectId: "45" }
```

The renderer reads each object's `x`, `y`, `width`, `height`, `rotation`, shape,
and points. That is how it redraws the saved map in the same state.

### Storage summary

```text
Floor settings  -> floors collection
Rooms and walls -> map-objects collection
Navigation dots -> map-nodes collection
Connections     -> path-edges collection
Uploaded images -> media collection
```

The browser edits temporary JavaScript data. The server converts and validates
that data, and Payload stores it as structured SQLite records. Loading the map
performs the same process in reverse.

## How the editor currently loads a floor

The server requests the floor and its related records from Payload CMS. The
objects, nodes, and edges are requested at the same time.

```text
                  +--> Load map objects
Open floor --> Server --> Load navigation nodes
                  +--> Load path edges
                  +--> Load floor settings
```

After the requests finish, the server returns one result to the editor:

```json
{
  "floor": {},
  "objects": [],
  "nodes": [],
  "edges": []
}
```

The editor places this data into its Zustand store and draws the map.

## Does the current loader support pagination?

No. The current loader does not request every page.

Each collection request uses:

```ts
limit: 1000
```

This allows the server to return up to 1,000 records for each collection.

```text
Maximum map objects returned: 1,000
Maximum navigation nodes returned: 1,000
Maximum path edges returned: 1,000
```

This can look like complete-floor loading when a floor is small, but it is
actually a single large page.

## When does the current approach work?

It works when the floor has no more than:

- 1,000 map objects;
- 1,000 navigation nodes;
- 1,000 path edges.

For example:

```text
Map objects:       250  -> all records load
Navigation nodes:  600  -> all records load
Path edges:        900  -> all records load
```

## What happens above the limit?

If a collection contains more than 1,000 matching records, the remaining
records are not requested.

```text
Path edges in database: 1,350
Path edges loaded:      1,000
Path edges missing:       350
```

This can produce an incomplete map or navigation graph. Possible symptoms
include:

- missing rooms or map features;
- missing navigation nodes;
- route lines that suddenly stop;
- destinations that appear unreachable;
- incorrect shortest routes;
- edges referring to nodes that were not loaded.

The database records are not deleted. They are simply missing from the data
returned to the editor.

## What is real pagination?

Pagination means loading records in smaller pages and continuing until no pages
remain.

```text
Load page 1
    |
    v
Is there another page? -- No --> Finished
    |
   Yes
    |
    v
Load page 2
```

Payload responses provide pagination information, including whether another
page exists. The server can use that information to request every page.

Conceptual example:

```ts
const allRecords = [];
let page = 1;
let hasNextPage = true;

while (hasNextPage) {
  const result = await payload.find({
    collection: "map-objects",
    limit: 250,
    page,
    where: { floor: { equals: floorId } },
  });

  allRecords.push(...result.docs);
  hasNextPage = result.hasNextPage;
  page += 1;
}
```

The exact implementation may use a reusable helper so objects, nodes, and
edges do not duplicate this logic.

## Recommended approach for the current editor

Pagination should happen on the server. The browser editor should continue to
receive one complete result.

```text
Database
   |
   +-- Page 1 --+
   +-- Page 2 --+--> Server combines all pages
   +-- Page 3 --+              |
                                v
                     One complete floor result
                                |
                                v
                             Editor
```

This approach provides two benefits:

1. The editor remains simple because it does not manage page numbers.
2. The navigation graph is built only after all nodes and edges are available.

Objects, nodes, and edges can each be paginated independently. Their page
requests may also run concurrently where safe.

## Why not display one page at a time?

A normal list can show page 1 and let the user click **Next**. A map and its
navigation graph are different.

The renderer may need every object to display the floor correctly. The route
finder needs all relevant nodes and edges before it can guarantee the shortest
path.

If only part of the graph is loaded, the app may incorrectly report that no
route exists.

For the current application, server-side pagination followed by combining the
pages is the safest design.

## Performance considerations

Proper pagination removes the 1,000-record correctness limit, but it does not
make an extremely large floor inexpensive to load.

As the map grows, loading everything may require more:

- database time;
- server memory;
- network bandwidth;
- browser memory;
- rendering time;
- graph-building time.

If maps become very large, possible future improvements include:

- loading objects near the visible map area;
- simplifying objects at low zoom levels;
- caching published floor data;
- loading visual objects separately from navigation data;
- dividing a building into map regions;
- using a dedicated graph endpoint or precomputed graph.

These optimizations are not necessary merely to fix the current pagination
limit. They become useful only when real map sizes cause performance problems.

## Current status

```text
Current behavior:
One request per collection, limited to 1,000 records

Recommended behavior:
Request every page on the server, combine the records, then return the floor
```

## Summary

The app currently tries to load a complete floor, but it only loads the first
1,000 objects, first 1,000 nodes, and first 1,000 edges. Proper server-side
pagination should retrieve every page before the editor renders the map or
builds the navigation graph.
