class Train {
    value; visible; id; eqString; position; level;
    constructor(id, value, position, level) {
        this.value = value;
        this.id = id;
        this.visible = true;
        this.eqString = value;
        this.position = position;
        this.level = level;
    }

    // TODO rotation of trains
    move(target, duration, delay) {
        let trainSVG = SVG.find('.train-' + this.id);

        trainSVG.animate(duration, delay, "now").move(target.x, target.y);

        setTimeout(function () { trainSVG.show(); }, delay);

        setTimeout(function () { trainSVG.hide(); }, delay + duration - 1000);

        console.log("train (id=" + this.id + ") of value " + this.value + " moves, target: " + target.x + " " + target.y);
    }

}

class JoinedTrain extends Train {
    sign; subTrains;
    constructor(id, position, level) {
        super(id, undefined, position, level);
        this.visible = false;
        this.sign = "";
        this.subTrains = [];
    }

    // TODO visual part (sign at the station displays)
    updateSign(sign) {
        this.sign = sign;
        this.#calculate();
    }

    connectWith(train1, train2) {
        this.subTrains = [];
        this.subTrains.push(train1);
        this.subTrains.push(train2);
        this.visible = true;
        this.#calculate();
    }

    disconnectFrom(trainId) {
        let subtrainsIds = this.subTrains.map(x => x.id);
        if (subtrainsIds.includes(trainId)) {
            this.subTrains = this.subTrains.filter(x => x.id != trainId);
            this.sign = "";
            this.#calculate();
        }
    }

    // after station added or connecting
    #calculate() {
        if (this.sign.match(/^[*/+-]+$/) && this.subTrains.length == 2) {
            // right appearance in the equation
            this.subTrains.sort((x, y) => x.id - y.id);

            // not necessary brackets removed
            let train1 = this.subTrains[0];
            let train2 = this.subTrains[1];
            let ex1 = "(" + String(train1.eqString) + ")" + this.sign + "(" + String(train2.eqString) + ")";
            let ex2 = "(" + String(train1.eqString) + ")" + this.sign + String(train2.eqString);
            let ex3 = String(train1.eqString) + this.sign + "(" + String(train2.eqString) + ")";
            let ex4 = String(train1.eqString) + this.sign + String(train2.eqString);
            switch (eval(ex1)) {
                case eval(ex4): this.eqString = ex4; break;
                case eval(ex2): this.eqString = ex2; break;
                case eval(ex3): this.eqString = ex3; break;
                default: this.eqString = ex1;
            }
        } else if (this.subTrains.length == 1) {
            let train1 = this.subTrains[0];
            this.eqString = train1.eqString;
        }
        this.value = eval(this.eqString);
    }
}

class Game {
    // all equations for the game TODO: Equations (numbers under 20 look still good)
    #equations = ["3+6", "4+8*2", "4+8*2-5"];

    // points received in total
    #points = 0;

    /* equation specific params */

    // possible trains
    #trains = new Map;

    // current equation
    #equation = "";

    // for each level trains assigned 
    #levelsMap = new Map;

    #draw;

    #rails = [];

    constructor() {
        this.loadEquation(this.#equations[0]);
    }

    // loading of an equation & drawing trains and stations
    loadEquation(equation) {
        this.#levelsMap = new Map;
        this.#trains = new Map;
        this.#rails = [];

        // positions for 0,1,2,3 trains
        const positionsArray = [undefined, undefined, [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 30, y: 300 }], [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 630, y: 300 }, { x: 30, y: 300 }, { x: 330, y: 450 }, { x: 30, y: 600 }], [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 630, y: 300 }, { x: 930, y: 450 }, { x: 30, y: 300 }, { x: 330, y: 450 }, { x: 630, y: 600 }, { x: 30, y: 600 }, { x: 330, y: 750 },  { x: 30, y: 900 }]];

        // classification to id and level for 0,1,2,3 trains (increasing from left to right)
        const classificationsArray = [undefined, undefined, [{ id: 0, level: 0 }, { id: 2, level: 0 }, { id: 1, level: 1 }], [{ id: 0, level: 0 }, { id: 3, level: 0 }, { id: 5, level: 0 }, { id: 1, level: 1 }, { id: 4, level: 1 }, { id: 2, level: 2 }], [{ id: 0, level: 0 }, { id: 4, level: 0 }, { id: 7, level: 0 }, { id: 9, level: 0 }, { id: 1, level: 1 }, { id: 5, level: 1 }, { id: 8, level: 1 }, { id: 2, level: 2 }, { id: 6, level: 2 }, { id: 3, level: 3 }]];

        this.#equation = equation;
        let eqArr = Array.from(equation).filter(x => String(x).match(/^[\d */+-]+$/));
        let eqNumbers = eqArr.filter(x => !isNaN(Number(x)));
        let startTrainsNumber = eqNumbers.length;

        let positionsOfTrains = positionsArray[startTrainsNumber]; // TODO finding best positions on canvas for trains + stations(joined trains)
        let classification = classificationsArray[startTrainsNumber];

        // all possible trains
        for (let i = 0; i < positionsOfTrains.length; i++) {
            // new id (necessary for calculating the order of the new equation)
            let id = classification[i].id;
            let level = classification[i].level;

            let train;

            if (i < startTrainsNumber) {
                train = new Train(id, eqNumbers[i], positionsOfTrains[id], level);
                this.#trains.set(id, train);
            } else {
                train = new JoinedTrain(id, positionsOfTrains[id], level);
                this.#trains.set(id, train);
            }

            if (this.#levelsMap.has(level)) {
                let oldLevelArray = this.#levelsMap.get(level);
                oldLevelArray.push(train);
                this.#levelsMap.set(level, oldLevelArray.sort((x, y) => x.id - y.id));
            } else {
                this.#levelsMap.set(level, [train]);
            }
        }
        this.#drawElements();
    }

    // TODO choose sign from dropdown (triggered by user by choosing sign)
    chooseSign(trainId, sign) {
        let train = this.#trains.get(trainId);
        train.updateSign(sign);
    }

    // TODO connect with rails (triggered by user by clicking on station)
    connectTrains(targetTrainId) {
        let targetTrain = this.#trains.get(targetTrainId);
        let targetLevel = targetTrain.level;

        let indexOfTargetTrain = this.#levelsMap.get(targetLevel).indexOf(targetTrain);

        // get 2 adjacent trains from the previous level
        let adjacentTrains = this.#levelsMap.get(targetLevel - 1).filter((x, index) => (index == indexOfTargetTrain || index == indexOfTargetTrain + 1));

        // for each train from the target level disconnect 2 adjacent (to the target train) trains
        this.#levelsMap.get(targetLevel).forEach(train => {
            train.disconnectFrom(adjacentTrains[0].id);
            SVG.find('.rails-' + adjacentTrains[0].id + '-' + train.id).remove();
            this.#rails = this.#rails.filter(x => !((x.startId == adjacentTrains[0].id)))

            train.disconnectFrom(adjacentTrains[1].id);
            SVG.find('.rails-' + adjacentTrains[1].id + '-' + train.id).remove();
            this.#rails = this.#rails.filter(x => !((x.startId == adjacentTrains[1].id)))
        })

        // connect target train with 2 adjacent trains
        targetTrain.connectWith(adjacentTrains[0], adjacentTrains[1]);

        // add rails to access them later
        let rails = [{ start: { x: adjacentTrains[0].position.x + 50, y: adjacentTrains[0].position.y }, target: targetTrain.position, startId: adjacentTrains[0].id, targetId: targetTrain.id }, { start: { x: adjacentTrains[1].position.x + 50, y: adjacentTrains[1].position.y }, target: targetTrain.position, startId: adjacentTrains[1].id, targetId: targetTrainId }];
        
        // if the rails aim to final station
        if (this.#levelsMap.size - 1 == targetTrainId) {
            rails.push({ start: targetTrain.position, target: {x: targetTrain.position.x + 500, y: targetTrain.position.y}, startId: targetTrainId, targetId: targetTrainId })
        }
        
        this.#drawRails(rails);

        this.#rails = this.#rails.concat(rails).flat();

        // draw stations new
        let trainsArr = Array.from(this.#trains.values());
        let stations = trainsArr.filter(x => x instanceof (JoinedTrain));
        this.#drawStations(stations);
    }

    #drawElements() {
        this.#clearCanvas();
        this.#draw = SVG().addTo('#trains').size('100%', '100%');

        let trainsArr = Array.from(this.#trains.values());
        let startTrains = trainsArr.filter(x => x.value);
        let stations = trainsArr.filter(x => x instanceof (JoinedTrain));

        this.#drawRails(this.#rails);

        this.#drawTrains(startTrains);

        this.#drawStations(stations);
    }

    #drawRails(rails) {
        for (let i = 0; i < rails.length; i++) {
            let start = rails[i].start;
            let target = rails[i].target;
            let startId = rails[i].startId;
            let targetId = rails[i].targetId;
            let group = this.#draw.group();
            group.addClass('rails-' + startId + '-' + targetId);
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 20, color: '#4d4b42', linecap: "round" }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 30, color: '#4d4b42', linecap: "round", opacity: 0.7 }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 37, color: '#4d4b42', linecap: "round", opacity: 0.4 }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 39, color: '#4d4b42', linecap: "round", opacity: 0.1 }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 20, color: "#000000", dasharray: '1 4' }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 10) + ' S ' + target.x / 1.15 + ' ' + (target.y + 10) + ', ' + target.x + ' ' + (target.y + 10)).stroke({ width: 2, color: "#000000", linecap: "round" }).fill('none')
            group.path('M' + start.x + ' ' + (start.y + 20) + ' S ' + target.x / 1.15 + ' ' + (target.y + 20) + ', ' + target.x + ' ' + (target.y + 20)).stroke({ width: 2, color: "#000000" }).fill('none');

            SVG.find('.station-' + targetId).before(group);
            SVG.find('.station-' + startId).before(group);
            SVG.find('.train-' + targetId).before(group);
            SVG.find('.train-' + startId).before(group);
        }
    }

    // TODO drawing trains 
    #drawTrains(trains) {
        // drawing loks (https://svgjs.com/docs/3.0/getting-started/)
        for (let i = 0; i < trains.length; i++) {
            let train = trains[i];
            let x = train.position.x;
            let y = train.position.y;
            let group = this.#draw.group();

            group.addClass('train-' + train.id);
            group.rect(50, 20).fill('#6885c4').move(x, y);
            group.text(String(train.value)).font({
                family: 'Helvetica'
                , size: 15
                , anchor: 'middle'
                , leading: '1.5em'
            }).move(train.position.x + 20, train.position.y);

            // drawing cars
            let modulo = Number(train.value) % 5;
            let fullCarsNumber =  Math.floor(Number(train.value) / 5);
            let carsNumber = fullCarsNumber + ((modulo==0) ? 0 : 1);

            for (let j = 0; j < carsNumber ; j++) {
                x = x - 42;

                // new car
                group.rect(40, 20).fill('#4251f5').move(x, y);

                let bars = (fullCarsNumber <= j) ? modulo : 5;

                // new bar
                for (let k = 0; k < bars; k++) {
                    group.rect(40, 3).fill('#6e3018').move(x, y + 17 - 4 * k);
                }
            }

            if (train instanceof JoinedTrain) {
                group.hide();
            }
        }
    }

    #drawStations(stations) {
        let stationSmallSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="105px" height="69px" viewBox="-0.5 -0.5 105 69"><defs/><g><rect x="4" y="32.4" width="96" height="36" fill="#d9c4a0" stroke="none" pointer-events="all"/><path d="M 0 40.4 L 8 12.4 L 96 12.4 L 104 40.4 Z" fill="#3d2a26" stroke="none" pointer-events="all"/><path d="M 39.6 -22 L 63.6 12 L 39.6 46 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,51.6,12)" pointer-events="all"/><ellipse cx="51.6" cy="24.4" rx="10" ry="10" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="40.9" y="13.9" width="21.4" height="21" fill="none" stroke="none" pointer-events="all"/><path d="M 56.44 28.05 C 56.64 28.22 56.67 28.54 56.46 28.78 C 56.3 28.94 56.01 29.03 55.77 28.86 L 51.09 25.34 C 50.99 25.23 50.89 25.13 50.9 24.91 L 50.9 17.22 C 50.9 16.91 51.18 16.7 51.44 16.7 C 51.77 16.7 51.97 17 51.97 17.22 L 51.97 24.68 Z M 51.65 33.16 C 56.93 33.16 60.52 28.8 60.52 24.41 C 60.52 19.07 56.04 15.65 51.63 15.65 C 45.77 15.65 42.69 20.63 42.69 24.17 C 42.69 30.13 47.52 33.16 51.65 33.16 Z M 51.55 34.9 C 46.27 34.9 41.03 30.94 40.9 24.28 C 40.9 19.17 45.28 13.9 51.56 13.9 C 57.08 13.9 62.3 18.1 62.3 24.46 C 62.3 30.1 57.66 34.9 51.55 34.9 Z" fill="#000000" stroke="none" pointer-events="all"/><rect x="68" y="44.4" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="84" y="44.4" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><path d="M 39.6 47.2 Q 64.4 47.2 64.4 56 Q 64.4 64.8 39.6 64.8 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,52,56)" pointer-events="all"/><rect x="12" y="44" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="28" y="44" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/></g></svg>';
        let stationBigSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="157px" height="111px" viewBox="-0.5 -0.5 157 111"><defs/><g><path d="M 102.04 -11.27 L 129.94 13.85 L 102.04 38.97 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,115.99,13.85)" pointer-events="all"/><rect x="84" y="41.6" width="64" height="68" fill="#d9c4a0" stroke="none" pointer-events="all"/><rect x="4" y="73.6" width="80.4" height="36" fill="#d9c4a0" stroke="none" pointer-events="all"/><path d="M 76 45.6 L 84 25.6 L 148 25.6 L 156 45.6 Z" fill="#3d2a26" stroke="none" pointer-events="all"/><ellipse cx="116" cy="28.2" rx="13.200000000000001" ry="13.200000000000001" fill="#ffffff" stroke="#000000" stroke-width="2" pointer-events="all"/><path d="M 0 81.6 L 8 61.6 L 84.4 61.6 L 92.4 81.6 Z" fill="#3d2a26" stroke="none" pointer-events="all"/><rect x="112" y="53.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="96" y="53.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="128" y="53.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="91.6" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="132" y="85.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="112" y="85.2" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="27.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="75.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="43.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="59.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><path d="M 102 85.6 Q 130 85.6 130 95.6 Q 130 105.6 102 105.6 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,116,95.6)" pointer-events="all"/><rect x="12" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/></g></svg>';

        for (let i = 0; i < stations.length; i++) {
            let station = stations[i];
            SVG.find('.station-' + station.id).remove();
            let group = this.#draw.group();
            group.addClass('station-' + station.id);
            if (station.subTrains.length == 2) {
                group.svg(stationBigSVG).move(station.position.x - 70, station.position.y - 70);
                let signPosition;
                switch(station.sign) {
                    case '*': signPosition = {x: station.position.x + 39, y: station.position.y - 56}; break;
                    case '-': signPosition = {x: station.position.x + 42, y: station.position.y - 62}; break;
                    case '/': signPosition = {x: station.position.x + 41, y: station.position.y - 60}; break;
                    default: signPosition = {x: station.position.x + 38, y: station.position.y - 60};
                }
                group.text(station.sign).font({
                    family: 'Helvetica'
                    , size: 25
                    , anchor: 'start'
                    , weight: 900
                }).move(signPosition.x, signPosition.y);
    
            } else {
                group.svg(stationSmallSVG).move(station.position.x - 30, station.position.y - 30);
            }
        }
    }

    // TODO clear canvas
    #clearCanvas() {
        $('#trains').html("");
        $('#result').text("");
    }

    // loading the next round with a new equation
    nextRound() {
        this.loadEquation(this.#equations[Math.floor((this.#equations.length - 1) * Math.random() + 1)]);
    }

    // reloading the canvas
    reset() {
        this.loadEquation(this.#equation);
    }

    giveHint() {
        console.log("Hint for user should be displayed!");
    }

    startPlayMode() {
        // creates now as well joined trains
        this.#drawElements();

        // TODO blocking click events

        let trains = Array.from(this.#trains.values());

        if ([...trains].filter(x => x instanceof JoinedTrain && x.subtrains == 0).length != 0) {
            alert("Connect all trains!");
            return;
        }

        let finalTrain = this.#trains.get(this.#levelsMap.size - 1);
        let duration = 6000;
        let delay = 0;

        // firstly trains from level 0 goes, later level 1, 2 ...
        for (let i = 1; i < this.#levelsMap.size; i++) {
            this.#levelsMap.get(i).forEach(train => {
                train.subTrains.forEach(subtrain => {
                    subtrain.move(train.position, duration - 1500, delay);
                    $('#result').text(train.eqString);
                    console.log('Subequation: ' + train.eqString);
                });
            });
            delay += duration - 500;
        }

        // check solution correctness 
        if (eval(this.#equation) == finalTrain.value) {
            this.#points = this.#points + 10;
            console.log("Correct!");
            // TODO feedback popup 
        } else {
            console.log("Incorrect!");
            // TODO explosion
        }

        let points = this.#points;

        setTimeout(function () {
            finalTrain.move({ x: finalTrain.position.x + 250, y: finalTrain.position.y }, duration, 0);
            $('#result').append("=" + finalTrain.value);
            $('#points').text(points);
        }, delay);
    }
}

// version with the whole equation
class GameVersion1 extends Game {
    constructor() {
        super();
    }

    loadEquation(equation) {
        super.loadEquation(equation);
        $('#target').text(equation + "=" + eval(equation));
    }
}

// version with the result only
class GameVersion2 extends Game {
    constructor() {
        super();
    }

    loadEquation(equation) {
        super.loadEquation(equation);
        $('#target').text(eval(equation));
    }
}

let game = new GameVersion1;
console.log(game);
game.nextRound();
game.giveHint();
game.chooseSign(4, "*");
game.connectTrains(1);
game.connectTrains(4);
game.connectTrains(2);
game.chooseSign(2, "+");
game.startPlayMode();


/*
let game = new GameVersion1;
console.log(game);
game.nextRound();
game.giveHint();
game.connectTrains(1);
game.connectTrains(8);
game.connectTrains(5);
game.chooseSign(5, "*");
game.connectTrains(2);
game.connectTrains(6);
game.chooseSign(6, "-");
game.connectTrains(3);
game.chooseSign(3, "+");
game.startPlayMode();

0
   1
3     2
   4
5

such ids are needed for the correct final equation
*/