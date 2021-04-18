var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Equation = /** @class */ (function () {
    function Equation(eqString) {
        this.eqString = eqString;
        var eqArr = Array.from(eqString).filter(function (x) { return String(x).match(/^[\d */+-]+$/); });
        this.eqNumbers = eqArr.filter(function (x) { return !isNaN(Number(x)); });
        this.eqSigns = eqArr.filter(function (x) { return isNaN(Number(x)); });
    }
    return Equation;
}());
var Train = /** @class */ (function () {
    function Train(id, value) {
        this.value = value;
        this.id = id;
        this.selectable = true;
        this.visible = true;
        this.eqString = value;
    }
    return Train;
}());
var JoinedTrain = /** @class */ (function (_super) {
    __extends(JoinedTrain, _super);
    function JoinedTrain(id) {
        var _this = _super.call(this, id, undefined) || this;
        _this.visible = false;
        _this.selectable = false;
        _this.subTrains = [];
        return _this;
    }
    JoinedTrain.prototype.updateSign = function (sign) {
        this.sign = sign;
        this.calculate();
    };
    JoinedTrain.prototype.connectWith = function (train) {
        if (this.subTrains.length < 2 && train.selectable) {
            this.subTrains.push(train);
            train.selectable = false;
        }
        else {
            console.error("Error during connecting");
        }
        this.visible = true;
        this.calculate();
    };
    JoinedTrain.prototype.disconnectFrom = function (train) {
        this.subTrains.filter(function (x) { return x.id != train.id; });
        train.selectable = true;
        this.selectable = false;
        if (this.subTrains.length == 0) {
            this.visible = false;
        }
    };
    JoinedTrain.prototype.calculate = function () {
        if (this.sign.match(/^[*/+-]+$/) && this.subTrains.length == 2) {
            this.subTrains.sort(function (x, y) { return x.id - y.id; });
            // not necessary brackets removed
            var train1 = this.subTrains[0];
            var train2 = this.subTrains[1];
            var ex1 = "(" + String(train1.eqString) + ")" + this.sign + "(" + String(train2.eqString) + ")";
            var ex2 = "(" + String(train1.eqString) + ")" + this.sign + String(train2.eqString);
            var ex3 = String(train1.eqString) + this.sign + "(" + String(train2.eqString) + ")";
            var ex4 = String(train1.eqString) + this.sign + String(train2.eqString);
            switch (eval(ex1)) {
                case eval(ex4):
                    this.eqString = ex4;
                    break;
                case eval(ex2):
                    this.eqString = ex2;
                    break;
                case eval(ex3):
                    this.eqString = ex3;
                    break;
                default: this.eqString = ex1;
            }
            this.value = eval(this.eqString);
            this.selectable = true;
        }
    };
    return JoinedTrain;
}(Train));
var Game = /** @class */ (function () {
    function Game() {
        // all equations for the game
        this.equations = [new Equation("3+6"), new Equation("1+2*4")];
        // positions for 0,1,2,3 trains
        this.positionsArray = [undefined, undefined, [{ x: 0, y: 0 }, { x: 0, y: 300 }, { x: 300, y: 150 }], [{ x: 0, y: 0 }, { x: 0, y: 300 }, { x: 0, y: 600 }, { x: 300, y: 150 }, { x: 300, y: 450 }, { x: 600, y: 300 }]];
        // ids for 0,1,2,3 trains
        this.idsArray = [undefined, undefined, [0, 2, 1], [0, 3, 5, 1, 4, 2]];
        // possible trains (order: Trains, JoinedTrains -> not in the train.id order!)
        this.trains = [];
        // available stations
        this.stations = [];
        this.points = 0;
        this.loadRound(this.equations[0]);
    }
    // loading of an equation & drawing trains and stations
    Game.prototype.loadRound = function (equation) {
        this.equation = equation;
        this.clearCanvas();
        var startTrainsNumber = equation.eqNumbers.length;
        this.trains = [];
        var positions = this.positionsArray[startTrainsNumber];
        var ids = this.idsArray[startTrainsNumber];
        for (var i = 0; i < positions.length; i++) {
            if (i < startTrainsNumber) {
                this.trains.push(new Train(ids[i], equation.eqNumbers[i]));
            }
            else {
                this.trains.push(new JoinedTrain(ids[i]));
            }
        }
        this.stations = equation.eqSigns;
        // drawing trains and stations (https://svgjs.com/docs/3.0/getting-started/)
        var drawTrains = SVG().addTo('#trains').size('100%', '100%');
        for (var i = 0; i < this.trains.length; i++) {
            drawTrains.rect(150, 50).opacity(this.trains[i].visible ? 1 : 0.3).fill('#6885c4').move(positions[i].x, positions[i].y);
            if (this.trains[i].value) {
                drawTrains.text(this.trains[i].value).move(positions[i].x, positions[i].y);
            }
        }
        var drawStations = SVG().addTo('#stations').size('100%', '100%');
        for (var i = 0; i < this.stations.length; i++) {
            drawStations.rect(250, 250).fill('#ff0000').move(i * 300, 0);
            drawStations.text(this.stations[i]).move(i * 300, 0);
        }
    };
    Game.prototype.nextRound = function () {
        this.loadRound(this.equations[Math.floor((this.equations.length - 1) * Math.random() + 1)]);
    };
    Game.prototype.clearCanvas = function () {
        $('#stations').html("");
        $('#trains').html("");
    };
    Game.prototype.reset = function () {
        this.loadRound(this.equation);
    };
    Game.prototype.moveTrain = function (train) {
        console.log("train " + train.id + " of value " + train.value + " moves");
    };
    Game.prototype.startPlayMode = function () {
        var _this = this;
        // check solution existence
        var finalTrain = this.trains.slice().filter(function (x) { return x.selectable && x instanceof JoinedTrain; });
        console.log(this.trains);
        // check if only one is selectable
        if (finalTrain.length != 1) {
            alert("Connect all trains!");
        }
        else {
            // move trains, block click events
            var res = "";
            this.trains.forEach(function (train) {
                if (train instanceof JoinedTrain) {
                    train.subTrains.forEach(function (subtrain) {
                        _this.moveTrain(subtrain);
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
            }
            else {
                alert("Incorrect!");
                // explosion
            }
        }
    };
    return Game;
}());
// version with the whole equation
var GameVersion1 = /** @class */ (function (_super) {
    __extends(GameVersion1, _super);
    function GameVersion1() {
        return _super.call(this) || this;
    }
    GameVersion1.prototype.loadRound = function (equation) {
        _super.prototype.loadRound.call(this, equation);
        $('#target').text(this.equation.eqString + "=" + eval(this.equation.eqString));
    };
    return GameVersion1;
}(Game));
// version with the result only
var GameVersion2 = /** @class */ (function (_super) {
    __extends(GameVersion2, _super);
    function GameVersion2() {
        return _super.call(this) || this;
    }
    GameVersion2.prototype.loadRound = function (equation) {
        _super.prototype.loadRound.call(this, equation);
        $('#target').text(eval(this.equation.eqString));
    };
    return GameVersion2;
}(Game));
var game = new GameVersion1;
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
