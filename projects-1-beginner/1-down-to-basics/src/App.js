import {useEffect, useState} from 'react';

const VANISH_TIME_MILLISECONDS = 1200;
const PERCEPTION_TIME_BUFFER_MILLISECONDS = 80;

export default function App() {
    const [entities, setEntities] = useState({});
    const [vanishTime, setVanishTime] = useState(VANISH_TIME_MILLISECONDS);

    function onClick(event) {
        const x = event.clientX;
        const y = event.clientY;

        const id = generateId();
        setEntities(entitiesCurrent => {
            const entitiesAlive = filterAliveEntities(entitiesCurrent);

            return {
                ...entitiesAlive,
                [id]: {
                    alive: true,
                    position: [x, y],
                    vanishTime: vanishTime
                }
            };
        });
    }

    return <main className="screen" onClick={onClick}>
        <VanishTimeSlider vanishTime={vanishTime} setVanishTime={setVanishTime}/>

        {Object.entries(entities).map(([id, entity]) => (
            <VanishingBall id={id} state={entity} setEntities={setEntities}/>
        ))}

    </main>
}


function VanishingBall({state, setEntities}) {
    const [alive, setAlive] = useState(true);
    const [x, y] = state.position;

    useEffect(() => {
        const aliveTimeOut = setTimeout(() => {
            setAlive(false);
            state.alive = false;
            setEntities(entitiesCurrent => filterAliveEntities(entitiesCurrent));

        }, state.vanishTime);

        return () => clearTimeout(aliveTimeOut);
    }, [])

    if (!alive) return null;

    // Reducing the animation time compare to the Entity's vanish time' allows it to shrink faster and all the way
    // down. At the same time shouldn't be that fast to the time reduce should be slow enough to be perceived.
    const vanishTime = state.vanishTime - PERCEPTION_TIME_BUFFER_MILLISECONDS;
    const style = {
        left: `${x}px`,
        top: `${y}px`,
        animation: `fadeGlow .8s ease-in infinite, shrink ${vanishTime}ms ease-in-out forwards`
    };
    return <div className="ball" style={style}></div>
}

function VanishTimeSlider({vanishTime, setVanishTime}) {

    return (
        <div className="slider">
            <input
                type="range"
                min="100"
                max="5000"
                value={vanishTime}
                onChange={(e) => setVanishTime(e.target.value)}
            />
            <p className="slider-value">Vanish (ms): {vanishTime}</p>
        </div>
    );
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}


function filterAliveEntities(entities) {
    return Object.fromEntries(
        Object.entries(entities)
            .filter(([_, entity]) => entity.alive)
    );
}

