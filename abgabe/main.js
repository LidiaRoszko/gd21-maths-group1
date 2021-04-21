class Train {
    value; selectable; visible; id; eqString; position; level;
    constructor(id, value, position) {
        this.value = value;
        this.id = id;
        this.selectable = true;
        this.visible = true;
        this.eqString = value;
        this.position = position;
    }

    // TODO moving 
    move(target, hide) {
        var trainSVG = SVG.find('.train-' + this.id);
        trainSVG.show();
        trainSVG.animate(4000, 0, 'now').move(target.x, target.y);

        if (hide) {
            setTimeout(function () { trainSVG.hide(); }, 5000);
        }

        console.log("train (id=" + this.id + ") of value " + this.value + " moves, target: " + target.x + " " + target.y);
    }

}

class JoinedTrain extends Train {
    sign; subTrains;
    constructor(id, position) {
        super(id, undefined, position);
        this.visible = false;
        this.selectable = false;
        this.subTrains = [];
    }

    // TODO visual part (station displaying)
    updateSign(sign) {
        this.sign = sign;
        this.#calculate();
    }

    // TODO visual part (rails appear)
    connectWith(train) {
        if (this.subTrains.length < 2 && train.selectable) {
            this.subTrains.push(train);
            train.selectable = false;
        } else {
            console.error("Error during connecting")
        }
        this.visible = true;
        this.#calculate();
    }

    // TODO visual part (rails dissappear)
    disconnectFrom(train) {
        this.subTrains.filter(x => x.id != train.id);
        train.selectable = true;
        this.selectable = false;
        if (this.subTrains.length == 0) {
            this.visible = false;
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

            this.value = eval(this.eqString);
            this.selectable = true;
        }
    }
}

class Game {
    // all equations for the game
    #equations = ["3+6", "1+2*4"];

    // positions for 0,1,2,3 trains
    #positionsArray = [undefined, undefined, [{ x: 30, y: 0, level: 0 }, { x: 330, y: 150, level: 1 }, { x: 30, y: 300, level: 0 }], [{ x: 30, y: 0, level: 0 }, { x: 330, y: 150, level: 1 }, { x: 630, y: 300, level: 2 }, { x: 30, y: 300, level: 0 }, { x: 330, y: 450, level: 1 }, { x: 30, y: 600, level: 0 }]]

    // ids for 0,1,2,3 trains (increasing from left to right)
    #idsArray = [undefined, undefined, [0, 2, 1], [0, 3, 5, 1, 4, 2]]

    // possible trains
    #trains = new Map;

    // available stations
    #stations = [];

    // current equation
    #equation;

    // points received in total
    #points = 0;

    constructor() {
        this.loadEquation(this.#equations[0]);
    }

    // loading of an equation & drawing trains and stations
    loadEquation(equation) {
        this.#equation = equation;
        let eqArr = Array.from(equation).filter(x => String(x).match(/^[\d */+-]+$/));

        // start trains
        let eqNumbers = eqArr.filter(x => !isNaN(Number(x)));
        let startTrainsNumber = eqNumbers.length;

        // stations
        let eqSigns = eqArr.filter(x => isNaN(Number(x)));

        let positionsOfTrains = this.#positionsArray[startTrainsNumber]; // TODO finding best positions on canvas for trains + stations(joined trains)
        let ids = this.#idsArray[startTrainsNumber];

        for (let i = 0; i < positionsOfTrains.length; i++) {
            // new id (necessary for calculating the order of the new equation)
            let j = ids[i];
            if (i < startTrainsNumber) {
                this.#trains.set(j, new Train(j, eqNumbers[i], positionsOfTrains[j]));
            } else {
                this.#trains.set(j, new JoinedTrain(j, positionsOfTrains[j]));
            }
        }

        this.#stations = eqSigns;
        this.#drawElements();
    }

    // triggered by user by drop of the station on the placeholder
    addStation(trainId, sign) {
        let train = this.#trains.get(trainId);
        train.updateSign(sign);
    }

    // triggered by user by connecting
    connectTrains(newTrainId, oldTrainId) {
        let train = this.#trains.get(newTrainId);
        train.connectWith(this.#trains.get(oldTrainId))
    }

    // triggered by user by disconnecting
    disconnectTrains(newTrainId, oldTrainId) {
        let train = this.#trains.get(newTrainId);
        train.disconnectFrom(this.#trains.get(oldTrainId));
    }

    // TODO drawing trains and stations and placeholders for stations
    #drawElements() {
        this.#clearCanvas();

        let trainsArr = Array.from(this.#trains.values());
        let trains = trainsArr.filter(x => x.value);
        let stations = trainsArr.filter(x => x instanceof (JoinedTrain));

        let draw = SVG().addTo('#trains').size('100%', '100%');
        this.#drawTrains(trains, draw);

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

        /*         let drawStations = SVG().addTo('#stations').size('100%', '100%');
                for (let i = 0; i < this.#stations.length; i++) {
                    drawStations.rect(250, 250).fill('#ff0000').move(i * 300, 0);
                    drawStations.text(this.#stations[i]).move(i * 300, 0);
                } */
    }

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

    // TODO clear canvas
    #clearCanvas() {
        //$('#stations').html("");
        $('#trains').html("");
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

        // check solution existence = check if only one train is selectable and is joined train
        let finalTrainArr = Array.from(this.#trains.values()).filter(x => x.selectable && x instanceof JoinedTrain);

        if (finalTrainArr.length != 1) {
            alert("Connect all trains!");
        } else {
            let finalTrain = finalTrainArr[0];
            // TODO blocking click events

            let oldLevel = 1;
            let finalTrainDelay = 4000;
            // joined trains segregated according to the order of appearing
            Array.from(this.#trains.values()).filter(x => x instanceof JoinedTrain).sort((x, y) => { return (x.position.level - y.position.level); }).forEach(train => {
                let level = train.position.level;
                let delay = 5000;
                if (oldLevel == level) {
                    delay = 1000;
                }
                finalTrainDelay += delay;
                setTimeout(function () {
                    train.subTrains.forEach(subtrain => {
                        subtrain.move(train.position, true);
                        $('#result').text(train.eqString);
                        console.log('Subequation: ' + train.eqString);
                    });
                }, delay);
            });
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
                finalTrain.move({ x: finalTrain.position.x + 200, y: finalTrain.position.y, level: finalTrain.position.level }, false);

                $('#result').append("=" + finalTrain.value);

                $('#points').text(points);
            }, finalTrainDelay)
        }
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
game.giveHint();
/* game.addStation(1, "+");
game.connectTrains(1,2);
game.connectTrains(1,0);
game.startPlayMode(); */

console.log("---------Game object---------")
console.log(game)

// next round
console.log("---------Round started (incorrect)---------")
game.nextRound();
game.addStation(1, "+");
console.log("+ sign added to the station 1")
game.connectTrains(1, 0);
console.log("train of value 1 (id=0) connected to the station (id=1)")
game.connectTrains(1, 3);
console.log("train of value 2 (id=3) connected to the station (id=1)")

game.addStation(2, "*");
console.log("* sign added to the station 2")
game.connectTrains(2, 5);
console.log("train of value 3 (id=5) connected to the station (id=2)")
game.connectTrains(2, 1);
console.log("train of value 4 (id=1) connected to the station (id=2)")

console.log("---------Play mode started---------")
game.startPlayMode();

setTimeout(function() {
    
// next round
console.log("---------Round started (correct)---------")
game.nextRound();
game.addStation(4, "*");
console.log("* sign added to the station 4")
game.connectTrains(4, 5);
console.log("train of value 4 (id=5) connected to the station (id=4)")
game.connectTrains(4, 3);
console.log("train of value 2 (id=3) connected to the station (id=4)")

game.addStation(2, "+");
console.log("+ sign added to the station 2")
game.connectTrains(2, 0);
console.log("train of value 1 (id=0) connected to the train (id=2)")
game.connectTrains(2, 4);
console.log("train of value 8 (id=4) connected to the train (id=2)")

console.log("---------Play mode started---------")
game.startPlayMode();
}, 14000)