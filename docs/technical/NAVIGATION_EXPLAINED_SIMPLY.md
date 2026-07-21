# Navigation Explained Simply

Wayfinder's navigation system is similar to connecting dots on a map.

## 1. The map contains places

Places include rooms, entrances, washrooms, elevators, stairs, and other
destinations.

```text
Entrance                         Room 204
   O                                O
```

## 2. Places are connected to navigation points

Each place has a nearby navigation point. The point shows where a person can
stand or walk.

```text
Entrance -> O                    O <- Room 204
```

These navigation points are called **nodes**.

## 3. Lines connect the navigation points

Lines tell the app where a person is allowed to walk.

```text
Entrance -> O-----O-----O-----O <- Room 204
```

These lines are called **edges**. Each edge can store:

- its distance in metres;
- whether people can travel in both directions;
- whether the path is wheelchair accessible;
- whether it is a walkway, staircase, elevator, escalator, or ramp.

Rooms are connected through doors and hallways. This prevents the app from
creating an impossible route through a wall.

## 4. The app creates a graph

The navigation points and connecting lines together create a **graph**.

In this project:

- a navigation point is a **graph node**;
- a connecting path is a **graph edge**;
- the edge distance is the cost of travelling between two nodes.

```text
        O Room B
        |
        4 m
        |
Entrance O-----O-----O Room A
         3 m   6 m
```

This is not a bar graph or line chart. It is a network showing which places are
connected and how expensive each connection is to travel.

The app builds this graph from all the building's navigation nodes and path
edges. It can also include connections between floors, such as stairs and
elevators.

## 5. The app finds the shortest route

When someone chooses a starting place and destination, the app compares the
available routes.

```text
Route 1: 10 m + 8 m + 5 m = 23 m
Route 2: 12 m + 15 m      = 27 m
```

The app selects Route 1 because it has the lowest total distance.

The calculation uses Dijkstra's algorithm. In simple terms, it means:

> Check the available paths and choose the one with the lowest total distance.

If the user selects **Accessible route only**, the app removes inaccessible
nodes and edges before finding the route.

## 6. The app displays the route

After choosing the route, the app draws a line through its navigation points.

```text
Start O=====O=====O=====O Destination
```

The total distance is the sum of all the edges in that route.

## 7. Routes can move between floors

Stairs, elevators, escalators, and ramps connect navigation points on different
floors.

```text
Floor 1 -> Elevator -> Floor 2
```

The app separates the complete route into floor sections. It displays the
current floor first and lets the user continue to the next floor section.

It does not compare the X and Y positions of nodes on different floors because
each floor has its own separate map.

## 8. How the app can recognize directions

The app looks at three route points at a time:

```text
Previous point -> Current point -> Next point
```

Their positions show how the route changes at the current point.

### Continue straight

```text
O-----O-----O
```

### Turn right

```text
O-----O
      |
      O
```

### Turn left

```text
      O
      |
O-----O
```

The app can use these turns and the edge distances to create instructions:

1. Continue straight for 10 metres.
2. Turn right and continue for 6 metres.
3. Take the elevator to Floor 2.
4. Turn left and continue for 5 metres.
5. You have arrived.

## 9. Voice guidance

The browser can read the same on-screen instruction aloud:

> Turn right and continue for six metres.

The app can provide buttons to:

- turn voice guidance on or off;
- repeat the current instruction;
- stop speaking;
- move to the next instruction.

Text directions should always remain visible, even when voice guidance is
enabled or unavailable.

## 10. Important limitation

Finding a route is not the same as tracking a person.

The app knows:

- the chosen starting point;
- the chosen destination;
- the planned route between them.

The app does not currently know:

- the user's live indoor location;
- which direction the user is facing;
- whether the user has reached the next turn;
- whether the user has left the route.

Without an indoor positioning system, the user must press **Next step** after
completing each instruction.

Automatic tracking would require another technology, such as Bluetooth
beacons, QR-code checkpoints, NFC tags, or Wi-Fi positioning.

## Simple summary

```text
Places connect to navigation points
                 |
                 v
     Walkable lines connect the points
                 |
                 v
 Nodes and lines create a navigation graph
                 |
                 v
      The app finds the shortest path
                 |
                 v
       The path is drawn on the map
                 |
                 v
Angles and distances become instructions
                 |
                 v
 Instructions appear as text or speech
```

In one sentence:

> The app connects walkable points, finds the shortest path between two places,
> draws that path, and can turn its distances and angles into instructions.
