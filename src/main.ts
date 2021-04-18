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
    move(target) {
        console.log("train " + this.id + " of value " + this.value + " moves, target: " + target.x + " " + target.y);
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
        this.calculate();
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
        this.calculate();
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
    calculate() {
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
    equations = ["3+6", "1+2*4"];

    // positions for 0,1,2,3 trains
    positionsArray = [undefined, undefined, [{ x: 0, y: 0, level: 0}, { x: 300, y: 150, level: 1 }, { x: 0, y: 300, level: 0 }], [{ x: 0, y: 0, level: 0 }, { x: 300, y: 150, level: 1 }, { x: 600, y: 300, level: 2 }, { x: 0, y: 300, level: 0 }, { x: 300, y: 450, level: 1 }, { x: 0, y: 600, level: 0 }]]

    // ids for 0,1,2,3 trains (increasing from left to right)
    idsArray = [undefined, undefined, [0, 2, 1], [0, 3, 5, 1, 4, 2]]

    // possible trains
    trains = new Map;

    // available stations
    stations = [];

    // current equation
    equation;

    // points received in total
    points = 0;

    constructor() {
        this.loadEquation(this.equations[0]);
    }

    // loading of an equation & drawing trains and stations
    loadEquation(equation) {
        this.equation = equation;
        let eqArr = Array.from(equation).filter(x => String(x).match(/^[\d */+-]+$/));

        // start trains
        let eqNumbers = eqArr.filter(x => !isNaN(Number(x))); 
        let startTrainsNumber = eqNumbers.length;

        // stations
        let eqSigns = eqArr.filter(x => isNaN(Number(x)));
        
        let positionsOfTrains = this.positionsArray[startTrainsNumber]; // TODO finding best positions on canvas for trains + stations(joined trains)
        let ids = this.idsArray[startTrainsNumber];

        for (let i = 0; i < positionsOfTrains.length; i++) {
            // new id (necessary for calculating the order of the new equation)
            let j = ids[i];    
            if (i < startTrainsNumber) {         
                this.trains.set(j, new Train(j, eqNumbers[i], positionsOfTrains[j]));
            } else {
                this.trains.set(j, new JoinedTrain(j, positionsOfTrains[j]));
            }
        }

        this.stations = eqSigns;

        this.drawElements();
    }

    // triggered by user by drop of the station on the placeholder
    addStation(trainId, sign) {
        let train = this.trains.get(trainId);
        train.updateSign(sign);
    }

    // triggered by user by connecting
    connectTrains(newTrainId, oldTrainId) {        
        let train = this.trains.get(newTrainId);
        train.connectWith(this.trains.get(oldTrainId))
    }

    // triggered by user by disconnecting
    disconnectTrains(newTrainId, oldTrainId) {        
        let train = this.trains.get(newTrainId);
        train.disconnectFrom(this.trains.get(oldTrainId));
    }

    // TODO drawing trains and stations and placeholders for stations
    drawElements() {
        this.clearCanvas();

        // drawing trains and stations (https://svgjs.com/docs/3.0/getting-started/)
        let drawTrains = SVG().addTo('trains').size('100%', '100%');
        for (let i = 0; i < this.trains.size; i++) {
            let train = this.trains.get(i);
            drawTrains.rect(150, 50).opacity(train.visible ? 1 : 0.3).fill('6885c4').move(train.position.x, train.position.y);
            if (train.value) {
                drawTrains.text(train.value).move(train.position.x, train.position.y);
            }
        }

        let drawStations = SVG().addTo('stations').size('100%', '100%');
        for (let i = 0; i < this.stations.length; i++) {
            drawStations.rect(250, 250).fill('ff0000').move(i * 300, 0);
            drawStations.text(this.stations[i]).move(i * 300, 0);
        }
    }

    // TODO clear canvas
    clearCanvas() {
        $('stations').html("");
        $('trains').html("");
        $('target').text("");
    }

    // loading the next round with a new equation
    nextRound() {
        this.loadEquation(this.equations[Math.floor((this.equations.length - 1) * Math.random() + 1)]);
    }

    // reloading the canvas
    reset() {
        this.loadEquation(this.equation);
    }

    giveHint() {
        console.log("hint for the student");
    }

    startPlayMode() {
        console.log(this.trains);
        // check solution existence = check if only one train is selectable and is joined train
        let finalTrain = Array.from(this.trains.values()).filter(x => x.selectable && x instanceof JoinedTrain);

        if (finalTrain.length != 1) {
            alert("Connect all trains!");
        } else {
            // TODO blocking click events

            // joined trains segregated according to the order of appearing
            Array.from(this.trains.values()).filter(x => x instanceof JoinedTrain).sort((x,y) => {return (x.position.level-y.position.level);}).forEach(train => {
                    train.subTrains.forEach(subtrain => {
                        subtrain.move(train.position);
                        $('result').text(train.eqString);
                        console.log(train.eqString);
                    });
            });
            $('result').append("=" + finalTrain[0].value);
            // check solution correctness 
            if (eval(this.equation) == finalTrain[0].value) {
                this.points = this.points + 10;
                $('points').text(this.points);
                alert("Correct! Your points: " + this.points);
                // TODO feedback popup 
            } else {
                alert("Incorrect!");
                // TODO explosion
            }
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
        $('target').text(equation + "=" + eval(equation));
    }
}

// version with the result only
class GameVersion2 extends Game {
    constructor() {
        super();
    }

    loadEquation(equation) {
        super.loadEquation(equation);
        $('target').text(eval(equation));
    }
}

let game = new GameVersion1;
console.log(game)
game.giveHint();
game.addStation(1, "+");
game.connectTrains(1,2);
game.connectTrains(1,0);
game.startPlayMode();

// next round
game.nextRound();
game.addStation(4, "*");
game.connectTrains(4,5);
game.connectTrains(4,3);

game.addStation(2,"+");
game.connectTrains(2,0);
game.connectTrains(2,4);
game.startPlayMode();