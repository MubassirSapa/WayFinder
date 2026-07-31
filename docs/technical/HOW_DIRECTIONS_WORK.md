# How Distance and Directions Work

This document explains how Wayfinder can calculate indoor distances and give
instructions such as:

- “Continue straight for 10 metres.”
- “Turn left.”
- “Take the elevator to Floor 2.”
- “You have arrived.”

No advanced mathematics knowledge is required to understand this document.

## The basic idea

The app does not navigate directly from one room drawing to another. Each
searchable place is connected to a **navigation node**. Navigation nodes are
points people can travel through, such as hallway points, entrances, stairs,
and elevators.

```text
Room A -> node -> hallway nodes -> node -> Room B
```

Lines called **path edges** connect the nodes. Together, the nodes and edges
form the building's navigation network.

When someone selects a starting place and destination, the app finds the
shortest valid route through this network.

## 1. How the app knows the distance

Every node has an `x` and `y` position on its floor map. These values are map
pixels, not metres.

The straight-line pixel distance between two connected nodes is calculated
from their positions:

```text
pixel distance = square root of ((change in x)^2 + (change in y)^2)
```

In code, the same calculation is simpler:

```ts
const pixelDistance = Math.hypot(
  secondNode.x - firstNode.x,
  secondNode.y - firstNode.y,
);
```

### Converting pixels into metres

Each floor can have a `metersPerPixel` scale. It tells the app how much real
distance one map pixel represents.

```text
distance in metres = pixel distance x metres per pixel
```

Example:

```text
Distance between nodes on the map: 200 pixels
Floor scale:                       0.05 metres per pixel
Real distance:                     200 x 0.05 = 10 metres
```

The calculated or manually configured real distance is saved on the connecting
edge as `distanceMeters`.

### Calculating the complete route distance

A route normally contains several edges. The app adds their saved distances:

```text
Start --4 m-- A --7 m-- B --3 m-- Destination

Total distance = 4 + 7 + 3 = 14 metres
```

The current shortest-path system already performs this addition and returns
`totalDistanceMeters`.

### Distance between objects

The distance shown to the user should be the **walkable route distance**, not a
straight line between the centres of two room drawings.

For example, two rooms may look close on the map but have a wall between them.
Measuring directly between the rooms would incorrectly suggest that the user
can walk through the wall. Connecting each room to the correct doorway or
hallway node gives a useful walking distance.

```text
Incorrect: Room A ---------------- Room B
                         through a wall

Correct:   Room A -> door -> hallway -> door -> Room B
```

### Moving between floors

Coordinates from different floors must not be compared. An `x` position of 100
on Floor 1 has no physical relationship to an `x` position of 100 on Floor 2.

Instead, floors are connected with a path edge representing stairs, an
elevator, an escalator, or a ramp. That edge has its own `distanceMeters` value,
which is included in the route total.

### Accuracy requirement

Distances will only be accurate when:

1. The floor's `metersPerPixel` value is calibrated correctly.
2. Navigation nodes are placed in the correct locations.
3. Edges follow paths that people can actually walk.
4. Cross-floor edges have reasonable configured distances.

## 2. How the app knows the direction

To recognize a turn, the app looks at three consecutive nodes:

```text
Previous node -> Current node -> Next node
```

The first line shows how the user enters the current node. The second line
shows how the user leaves it. The app compares the angle of those two lines.

### Straight

```text
A -------- B -------- C
```

The route barely changes angle at B, so the instruction is:

> Continue straight.

### Left turn

```text
          C
          |
A -------- B
```

The route bends left at B, so the instruction is:

> Turn left.

### Right turn

```text
A -------- B
          |
          C
```

The route bends right at B, so the instruction is:

> Turn right.

### U-turn

If the route changes by almost 180 degrees, the instruction is:

> Make a U-turn.

### How the angle is classified

The exact limits can be adjusted, but a simple rule is:

| Change in angle | Instruction |
| --- | --- |
| Less than about 30 degrees | Continue straight |
| About 30 to 150 degrees | Turn left or right |
| More than about 150 degrees | Make a U-turn |

One technical detail matters: screen map coordinates grow downward, unlike the
Y-axis in a normal mathematics graph. The turn calculation must account for
this so left and right are not reversed.

## 3. Building complete instructions

Once the route has been found, the app can walk through its nodes in order and
create instructions.

Example route:

```text
Entrance -> Hallway A -> Hallway B -> Elevator -> Floor 2 -> Room 204
```

Possible instructions:

1. Start at the main entrance on Floor 1.
2. Continue straight for 12 metres.
3. Turn right and continue for 6 metres.
4. Take the elevator to Floor 2.
5. Turn left and continue for 8 metres.
6. You have arrived at Room 204.

Each instruction can be displayed in a list on the screen. The current
instruction can also be shown prominently above the map.

## 4. Voice assistance

The same instruction text can be spoken using the browser's built-in Web Speech
API:

```ts
const message = new SpeechSynthesisUtterance(
  "Turn right and continue for 6 metres.",
);

window.speechSynthesis.speak(message);
```

The interface should include controls to:

- turn voice guidance on or off;
- repeat the current instruction;
- stop speaking;
- continue to the next instruction manually.

The app should still show every instruction as text. Voice is an accessibility
aid, not a replacement for visible directions.

Browser support and available voices vary by device. The app should check that
`speechSynthesis` exists and keep text directions working when speech is not
available.

## 5. What the current app already knows

The existing navigation implementation already:

- connects map nodes using path edges;
- stores `distanceMeters` on every edge;
- finds the shortest route with Dijkstra's algorithm;
- adds edge distances into `totalDistanceMeters`;
- splits a route into floor sections;
- identifies stairs, elevators, escalators, ramps, and walkways;
- draws the route on the active floor;
- lets the user continue to the next floor section.

## 6. What still needs to be added

The current implementation does not yet generate turn-by-turn instructions or
speak them. Those features would require:

1. Comparing each group of three route nodes to identify turns.
2. Creating readable instruction text from the turns and edge distances.
3. Displaying the instruction list and current step in the interface.
4. Adding speech controls using the Web Speech API.
5. Letting the user manually move between steps.

## 7. Important limitation: the app does not know where the user is

Calculating a route is different from tracking someone in real time.

At present, the app knows:

- the selected starting point;
- the selected destination;
- the planned route between them.

It does **not** automatically know:

- the user's live indoor location;
- which direction the phone is facing;
- whether the user has reached the next turn;
- whether the user has left the planned route.

Without indoor positioning, the user must press a button such as **Next step**
after completing an instruction.

Automatic guidance would require another location system, such as QR-code
checkpoints, Bluetooth beacons, Wi-Fi positioning, NFC tags, or another indoor
tracking technology. Phone compass data may help with orientation, but indoor
magnetic interference can make it unreliable.

## Summary

```text
Node coordinates + floor scale
              |
              v
       Edge distances in metres
              |
              v
       Shortest walkable route
              |
              v
   Angles between consecutive edges
              |
              v
 Straight / left / right / floor-change instructions
              |
              v
       On-screen text + optional speech
```

The map provides the geometry, the navigation graph provides the valid walking
path, and the route's angles provide the directions.
