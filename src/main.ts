class Equation {
    eqString; eqNumbers; eqSigns;
    constructor(eqString) {
        this.eqString = eqString;
        let eqArr = Array.from(eqString).filter(x => String(x).match(/^[\d */+-]+$/));
        this.eqNumbers = eqArr.filter(x => !isNaN(Number(x)));
        this.eqSigns = eqArr.filter(x => isNaN(Number(x)));
    }
}

class Train {
    value; selectable; visible; id; eqString;
    constructor(id, value) {
        this.value = value;
        this.id = id;
        this.selectable = true;
        this.visible = true;
        this.eqString = value;
    }
}

class JoinedTrain extends Train {
    sign; subTrains;
    constructor(id) {
        super(id, undefined);
        this.visible = false;
        this.selectable = false;
        this.subTrains = [];
    }

    updateSign(sign) {
        this.sign = sign;
        this.calculate();
    }

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

    disconnectFrom(train) {
        this.subTrains.filter(x => x.id != train.id);
        train.selectable = true;
        this.selectable = false;
        if (this.subTrains.length == 0) {
            this.visible = false;
        }
    }

    private calculate() {
        if (this.sign.match(/^[*/+-]+$/) && this.subTrains.length == 2) {
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
    protected equations = [new Equation("3+6"), new Equation("1+2*4")];

    // positions for 0,1,2,3 trains
    private positionsArray = [undefined, undefined, [{ x: 0, y: 0 }, { x: 0, y: 300 }, { x: 300, y: 150 }], [{ x: 0, y: 0 }, { x: 0, y: 300 }, { x: 0, y: 600 }, { x: 300, y: 150 }, { x: 300, y: 450 }, { x: 600, y: 300 }]]

    // ids for 0,1,2,3 trains
    private idsArray = [undefined, undefined, [0, 2, 1], [0, 3, 5, 1, 4, 2]]

    // possible trains (order: Trains, JoinedTrains -> not in the train.id order!)
    trains = [];

    // available stations
    stations = [];

    // current equation
    equation;

    // points
    points;

    constructor() {
        this.points = 0;
        this.loadRound(this.equations[0]);
    }

    // loading of an equation & drawing trains and stations
    protected loadRound(equation) {
        this.equation = equation;
        this.clearCanvas();
        let startTrainsNumber = equation.eqNumbers.length;
        this.trains = [];
        let positions = this.positionsArray[startTrainsNumber];
        let ids = this.idsArray[startTrainsNumber];

        for (let i = 0; i < positions.length; i++) {
            if (i < startTrainsNumber) {
                this.trains.push(new Train(ids[i], equation.eqNumbers[i]));
            } else {
                this.trains.push(new JoinedTrain(ids[i]));
            }
        }

        this.stations = equation.eqSigns;

        // drawing trains and stations (https://svgjs.com/docs/3.0/getting-started/)
        let drawTrains = SVG().addTo('#trains').size('100%', '100%')
        for (let i = 0; i < this.trains.length; i++) {
            drawTrains.rect(150, 50).opacity(this.trains[i].visible ? 1 : 0.3).fill('#6885c4').move(positions[i].x, positions[i].y);
            if (this.trains[i].value) {
                drawTrains.text(this.trains[i].value).move(positions[i].x, positions[i].y);
            }
        }

        let drawStations = SVG().addTo('#stations').size('100%', '100%');
        for (let i = 0; i < this.stations.length; i++) {
            drawStations.rect(250, 250).fill('#ff0000').move(i * 300, 0);
            drawStations.text(this.stations[i]).move(i * 300, 0);
        }
    }

    nextRound() {
        this.loadRound(this.equations[Math.floor((this.equations.length - 1) * Math.random() + 1)]);
    }

    private clearCanvas() {
        $('#stations').html("");
        $('#trains').html("");
    }

    reset() {
        this.loadRound(this.equation);
    }

    private moveTrain(train) {
        console.log("train " + train.id + " of value " + train.value + " moves");
    }

    startPlayMode() {
        // check solution existence
        let finalTrain = [...this.trains].filter(x => x.selectable && x instanceof JoinedTrain);
        console.log(this.trains)
        // check if only one is selectable
        if (finalTrain.length != 1) {
            alert("Connect all trains!");
        } else {
            // move trains, block click events
            let res = "";
            this.trains.forEach(train => {
                if (train instanceof JoinedTrain) {
                    train.subTrains.forEach(subtrain => {
                        this.moveTrain(subtrain);
                        $('#result').text(train.eqString);
                        console.log(train.eqString);
                    });
                    // timeout
                }
            });
            $('#result').append("=" + finalTrain[0].value);
            // check solution correctness 
            if (eval(this.equation.eqString) == finalTrain[0].value) {
                this.points = this.points + 10;
                $('#points').text(this.points);
                alert("Correct! Your points: " + this.points);
                // feedback popup
            } else {
                alert("Incorrect!");
                // explosion
            }
        }
    }
}

// version with the whole equation
class GameVersion1 extends Game {
    constructor() {
        super();
    }

    protected loadRound(equation) {
        super.loadRound(equation);
        $('#target').text(this.equation.eqString + "=" + eval(this.equation.eqString));
    }
}

// version with the result only
class GameVersion2 extends Game {
    constructor() {
        super();
    }

    protected loadRound(equation) {
        super.loadRound(equation);
        $('#target').text(eval(this.equation.eqString));
    }
}

let game = new GameVersion1;

// --- Correct ---

// drag and drop the station with sign on the right position
game.trains[2].updateSign("+");

// connect rails to the station
game.trains[2].connectWith(game.trains[1]);
game.trains[2].connectWith(game.trains[0]);

// start play mode
game.startPlayMode();

// next round
game.nextRound();

// --- Incorrect ---

// drag and drop the station with sign on the right position
game.trains[3].updateSign("+");

// connect rails to the station
game.trains[3].connectWith(game.trains[0]);
game.trains[3].connectWith(game.trains[1]);

// drag and drop the station with sign on the right position
game.trains[5].updateSign("*");

// connect rails to the station
game.trains[5].connectWith(game.trains[2]);
game.trains[5].connectWith(game.trains[3]);

// start play mode
game.startPlayMode();

// reset round
game.reset();

// --- Correct ---

// drag and drop the station with sign on the right position
game.trains[3].updateSign("*");

// connect rails to the station
game.trains[3].connectWith(game.trains[1]);
game.trains[3].connectWith(game.trains[2]);

// drag and drop the station with sign on the right position
game.trains[5].updateSign("+");

// connect rails to the station
game.trains[5].connectWith(game.trains[0]);
game.trains[5].connectWith(game.trains[3]);

// start play mode
game.startPlayMode();