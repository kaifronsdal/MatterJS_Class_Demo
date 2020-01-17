// start boilerplate code
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Events = Matter.Events,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

var engine = Engine.create(),
    world = engine.world,
    runner = Runner.create(),
    render = Render.create({
        element: document.body, engine: engine,
        options: {
            width: 800,
            height: 600
        }
    });
Render.run(render);
Runner.run(runner, engine);
Render.lookAt(render, {
    min: {x: 0, y: -1000},
    max: {x: 2000, y: 600}
});
// end boilerplate code

// lets user interact with bodies
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

render.mouse = mouse;

// create bodies
var box = Bodies.rectangle(320, 550, 30, 30);

var arm = Bodies.rectangle(200, 360, 320, 20);

var weight = Bodies.circle(350, 360, 50, {density: 0.005});

// join together arm and weight
var catapult = Body.create({parts: [weight, arm]});

// create swivel point
World.add(world, Constraint.create({
    bodyA: catapult,
    pointA: {x: -50, y: 0},
    pointB: {x: 250, y: 360},
    stiffness: 1,
    length: 0
}));

// create rope
var rope = Composites.stack(120, 540, 8, 1, 10, 10, function (x, y) {
    return Bodies.rectangle(x, y, 10, 4);
});
Composites.chain(rope, 0.5, 0, -0.5, 0, {stiffness: 0.8, length: 10, render: {type: 'line'}});

//connect rope to box and catapult
var release = Constraint.create({
    bodyB: rope.bodies[rope.bodies.length - 1],
    pointB: {x: 5, y: 0},
    bodyA: box,
    stiffness: 1,
    length: 30
});
Composite.add(rope, [
    release,
    Constraint.create({
        bodyB: rope.bodies[0],
        pointB: {x: -5, y: 0},
        bodyA: catapult,
        pointA: {x: -275, y: 0},
        stiffness: 1,
        length: 20
    })
]);

// set catapult rotation
Body.rotate(catapult, -Math.PI / 3, {x: 200, y: 350});

// add bodies to world
World.add(world, [
    box,
    catapult,
    rope,
    Bodies.rectangle(400, 600, 800, 50.5, {isStatic: true}),
    Bodies.rectangle(170, 450, 30, 50, {restitution: 0, isStatic: true})
]);

// release box at top of throw
Events.on(engine, 'beforeUpdate', function (event) {
    if (box.position.y < -100) {
        // very hacky way of disconnecting the rope from the box
        release.bodyA = null;
        release.pointA = {x: -10000, y: 0};
        release.bodyB = null;
        release.pointB = {x: -10000, y: 0};
        Composite.remove(world, release);
    }
});
