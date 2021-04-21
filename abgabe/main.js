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

    // TODO moving 
    move(target, duration, delay) {
        let trainSVG = SVG.find('.train-' + this.id);

        trainSVG.animate(duration, delay, "now").move(target.x, target.y);

        setTimeout(function () { trainSVG.show(); }, delay);

        setTimeout(function () { trainSVG.hide(); }, delay + duration + 500);

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
    // all equations for the game
    #equations = ["3+6", "1+2*4"];

    // points received in total
    #points = 0;

    /* equation specific params */

    // possible trains
    #trains = new Map;

    // current equation
    #equation = "";

    // for each level trains assigned 
    #levelsMap = new Map;

    constructor() {
        this.loadEquation(this.#equations[0]);
    }

    // loading of an equation & drawing trains and stations
    loadEquation(equation) {
        this.#levelsMap = new Map;
        this.#trains = new Map;

        // positions for 0,1,2,3 trains
        const positionsArray = [undefined, undefined, [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 30, y: 300 }], [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 630, y: 300 }, { x: 30, y: 300 }, { x: 330, y: 450 }, { x: 30, y: 600 }]];

        // classification to id and level for 0,1,2,3 trains (increasing from left to right)
        const classificationsArray = [undefined, undefined, [{ id: 0, level: 0 }, { id: 2, level: 0 }, { id: 1, level: 1 }], [{ id: 0, level: 0 }, { id: 3, level: 0 }, { id: 5, level: 0 }, { id: 1, level: 1 }, { id: 4, level: 1 }, { id: 2, level: 2 }]];

        this.#equation = equation;
        let eqArr = Array.from(equation).filter(x => String(x).match(/^[\d */+-]+$/));
        let eqNumbers = eqArr.filter(x => !isNaN(Number(x)));
        let startTrainsNumber = eqNumbers.length;

        let positionsOfTrains = positionsArray[startTrainsNumber]; // TODO finding best positions on canvas for trains + stations(joined trains)
        let classification = classificationsArray[startTrainsNumber];

        // all possible trains (start trains + joined trains)
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
            train.disconnectFrom(adjacentTrains[1].id);
        })

        // connect target train with 2 adjacent trains
        targetTrain.connectWith(adjacentTrains[0], adjacentTrains[1]);
    }

    #drawElements() {
        this.#clearCanvas();

        let trainsArr = Array.from(this.#trains.values());
        let startTrains = trainsArr.filter(x => x.value);
        let stations = trainsArr.filter(x => x instanceof (JoinedTrain));

        let draw = SVG().addTo('#trains').size('100%', '100%');
        this.#drawTrains(startTrains, draw);

        this.#drawStations(stations, draw);
    }

    // TODO drawing trains 
    #drawTrains(trains, draw) {
        // drawing loks (https://svgjs.com/docs/3.0/getting-started/)
        for (let i = 0; i < trains.length; i++) {
            let train = trains[i];
            let x = train.position.x;
            let y = train.position.y;
            let group = draw.group();

            group.addClass('train-' + train.id);
            group.rect(50, 20).fill('#6885c4').move(x, y);
            group.text(String(train.value)).font({
                family: 'Helvetica'
                , size: 15
                , anchor: 'middle'
                , leading: '1.5em'
            }).move(train.position.x + 20, train.position.y);

            // drawing cars
            let carsNumber = Math.floor(Number(train.value) / 5);
            let modulo = Number(train.value) % 5;

            for (let j = 0; j < carsNumber + 1; j++) {
                x = x - 42;

                // new car
                group.rect(40, 20).fill('#4251f5').move(x, y);

                let bars = (carsNumber == j) ? modulo : 5;

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

    // TODO drawing stations 
    #drawStations(stations, draw) {
        for (let i = 0; i < stations.length; i++) {
            let train = stations[i];
            let group = draw.group();
            group.addClass('station');
            group.rect(100, 50).fill('#754f4f').move(train.position.x, train.position.y - 10);
            group.polygon('0,25 100,25 50,0').fill('#2e1e1e').stroke({ width: 1 }).move(train.position.x, train.position.y - 35);
            group.text('Bahnhof ' + String(train.id)).font({
                family: 'Helvetica'
                , size: 15
                , anchor: 'middle'
                , leading: '1.5em'
            }).move(train.position.x + 15, train.position.y + 5);
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
        this.#drawElements();

        // TODO blocking click events

        let trains = Array.from(this.#trains.values());

        if ([...trains].filter(x => x instanceof JoinedTrain && x.subtrains == 0).length != 0) {
            alert("Connect all trains!");
            return;
        }

        let finalTrain = this.#levelsMap.get(this.#levelsMap.size - 1)[0];
        let duration = 6000;
        let delay = 0;

        for (let i = 1; i < this.#levelsMap.size; i++) {
            this.#levelsMap.get(i).forEach(train => {
                train.subTrains.forEach(subtrain => {
                    subtrain.move(train.position, duration - 1500, delay);
                    $('#result').text(train.eqString);
                    console.log('Subequation: ' + train.eqString);
                });
            });
            delay += duration;
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
            finalTrain.move({x: finalTrain.position.x + 250, y: finalTrain.position.y}, duration, 0);
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