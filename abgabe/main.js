function setSadCows(trainValue, solution) {
    if (trainValue >= solution) {
        $('.sadcow>p').text(0 + 'x').css('color','green');
        return 0;

    } else {
        $('.sadcow>p').text(solution - trainValue + 'x').css('color','red');
        return solution - trainValue;

    }
}
function setHappyCows(trainValue, solution) {
    if (trainValue > solution) {
        $('.happycow>p').text(solution + 'x').css('color','green');
        return solution;
    } else {
        $('.happycow>p').text(trainValue + 'x').css('color','green');
        return trainValue;

    }
}
function setGoodHay(trainValue, solution) {
        $('.goodhay>p').text(trainValue + 'x');
}
function setBadHay(trainValue, solution) {
    if (trainValue <= solution) {
        $('.badhay>p').text(0 + 'x').css('color','green');
        return 0;

    } else {
        $('.badhay>p').text(trainValue-solution + 'x').css('color','red');
        return trainValue-solution;

    }
}
function setPoints(points){
    $('.points').css("transform", "scale(1.5)");

    setTimeout(function(){
        $('.points').text(points+ ' Punkte');
        $('.points').css("transform", "scale(1)");
        
    },200);
}

class Game {
    // all equations for the game TODO: Equations (numbers under 20 look still good)
    equations = ['(15+9)+2=26',
        '(6+13)-11=8',
        '(1+10)*2=22',
        '(2+12)/2=7',
        '(9-1)+9=17',
        //'(13-10)-5=-2',
        '(14-8)*4=24',
        '(11-3)/4=2',
        '(2*6)+10=22',
        '(1*15)-7=8',
        '(4*3)*2=24',
        '(9*6)/3=18',
        '(14/7)+5=7',
        '(18/3)-2=4',
        '(16/4)*5=20',
        '(27/3)/3=3',
        '6+(8+4)=18',
        '3+(7-2)=8',
        '5+(3*5)=20',
        '7+(10/2)=12',
        '10-(1+6)=3',
        '8-(10-8)=6',
        '15-(3*2)=9',
        '13-(6/3)=11',
        '5*(1+4)=25',
        '12*(9-7)=24',
        '5*(3*2)=30',
        '12*(12/6)=24',
        '12/(2+1)=4',
        '15/(6-3)=5',
        '24/(2*3)=4',
        '30/(8/4)=15',
        /*'11+3+7+2=23',
        '4+1+11-5=11',
        '5+13-3*4=5',
        '12+2-15/5=11',
        '13+2*4+3=24',
        '5+10*1-7=8',
        '10-6+3+2=9',
        '11-4+12-9=10',
        '(3+1)*(5+2)=21',
        '(7+1)*(14-12)=16',
        '7+(12/3)*2=15',*/

    ];

    // points received in total
    points = 0;

    /* equation specific params */

    // possible trains
    trains = new Map;

    // current equation
    equation = "";

    // for each level trains assigned 
    levelsMap = new Map;

    draw;

    rails = [];

    chosenStation;
    currentLevel=1;
    constructor() {
        this.loadEquation(this.equations[Math.round(Math.random()*this.equations.length-1)]);
    }

    // loading of an equation & drawing trains and stations
    loadEquation(equation) {
        this.levelsMap = new Map;
        this.trains = new Map;
        this.rails = [];

        // positions for 0,1,2,3 trains
        let positionsArray = [undefined, undefined, [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 30, y: 300 }], [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 630, y: 300 }, { x: 30, y: 300 }, { x: 330, y: 450 }, { x: 30, y: 600 }], [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 630, y: 300 }, { x: 930, y: 450 }, { x: 30, y: 300 }, { x: 330, y: 450 }, { x: 630, y: 600 }, { x: 30, y: 600 }, { x: 330, y: 750 }, { x: 30, y: 900 }]];

        // classification to id and level for 0,1,2,3 trains (increasing from left to right)
        const classificationsArray = [undefined, undefined, [{ id: 0, level: 0 }, { id: 2, level: 0 }, { id: 1, level: 1 }], [{ id: 0, level: 0 }, { id: 3, level: 0 }, { id: 5, level: 0 }, { id: 1, level: 1 }, { id: 4, level: 1 }, { id: 2, level: 2 }], [{ id: 0, level: 0 }, { id: 4, level: 0 }, { id: 7, level: 0 }, { id: 9, level: 0 }, { id: 1, level: 1 }, { id: 5, level: 1 }, { id: 8, level: 1 }, { id: 2, level: 2 }, { id: 6, level: 2 }, { id: 3, level: 3 }]];
        let offset=200;
        positionsArray= positionsArray.map( positions=>{
            if(positions!=undefined){
                return positions.map(position=> { let newpos=position; newpos.x+=offset; return newpos;})
            }else{
                return positions;
            }
        })

        let rightSide = equation.match(/[=].*\d+/g)[0];
        let leftSide = equation.replace(rightSide, '');
        let eqArr = leftSide.match(/\d+/g);
        let eqNumbers = eqArr.filter(x => !isNaN(Number(x)));
        let startTrainsNumber = eqNumbers.length;
        this.equation = leftSide;
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
                this.trains.set(id, train);
            } else {
                train = new JoinedTrain(id, positionsOfTrains[id], level);
                this.trains.set(id, train);
            }

            if (this.levelsMap.has(level)) {
                let oldLevelArray = this.levelsMap.get(level);
                oldLevelArray.push(train);
                this.levelsMap.set(level, oldLevelArray.sort((x, y) => x.id - y.id));
            } else {
                this.levelsMap.set(level, [train]);
            }
        }
        this.drawElements();
    }

    // when on change event triggered
    chooseSign(sign) {
        $("#signButtons").hide();
        $("#signOverlay").hide();

        this.chosenStation.updateSign(sign);
        this.setStationBlur(this.chosenStation.id,false);
        let trainsArr = Array.from(this.trains.values());
        let stations = trainsArr.filter(x => x instanceof (JoinedTrain));

        this.drawStations(stations);
    }

    showSignButtons(station) {

        $("#signButtons").css("top", station.position.y + 50);
        $("#signButtons").css("left", station.position.x - 95);
        this.chosenStation = station;

        // overlay for "forcing" user to choose sign and prevent problems when the chosen station is again small
        $("#signButtons").show();
        $("#signOverlay").show();
    }

    setStationBlur(id, on) {
        if (on) {

            SVG.find('.small-station-' + id).css({
                transition: 'filter 1s easeIn',
                filter: 'drop-shadow(4px 4px 10px #ff0000) drop-shadow(-4px -4px 10px #ff0000)'
            });

            SVG.find('.big-station-' + id).css({
                transition: 'filter 1s',
                filter: 'drop-shadow(4px 4px 10px #ff0000) drop-shadow(-4px -4px 10px #ff0000)'
            });

        } else {
            SVG.find('.small-station-' + id).css('filter', null);
            SVG.find('.big-station-' + id).css('filter', null);
        }

    }
    checkUnconnectedTrains(station) {

        let unconnectedStations=Array.from(this.levelsMap.values()).flat();
        if(station==null){
            station = unconnectedStations[unconnectedStations];
        }
        unconnectedStations = unconnectedStations.filter(
            station => (station.connected == false || (station.bigStation == true && station.sign == "")));

        unconnectedStations = unconnectedStations.filter(
            unconnectedStation =>  {

                if(station==undefined){
                    return unconnectedStation.level < 999;
                }else{
                    return unconnectedStation.level < station.level;
                }
            });
               

        if (unconnectedStations.length > 0) {

            let minLevel = Math.min(...unconnectedStations.map(unconnectedStation => unconnectedStation.level));
            console.log(minLevel);

            //console.log(unconnectedStations);

            //console.log(minLevel);
            unconnectedStations = unconnectedStations.filter(unconnectedStation => unconnectedStation.level == minLevel);
            unconnectedStations.forEach(unconnectedStation => this.setStationBlur(unconnectedStation.id, true));
            return true;
        }
        else return false;
    }
    connectTrains(station) {

        if (this.checkUnconnectedTrains(station)) {
            return;
        }
        this.levelsMap.get(station.level).forEach(stationAtLevel=>{
            if(!stationAtLevel.connected){
                this.connectStation(stationAtLevel)
            }
        }
        );
        this.connectStation(station)
        this.showSignButtons(station);
    }
    connectStation(station){
        let targetTrainId=station.id;
        let targetTrain = this.trains.get(targetTrainId);
        let targetLevel = targetTrain.level;

        let indexOfTargetTrain = this.levelsMap.get(targetLevel).indexOf(targetTrain);

        // get 2 adjacent trains from the previous level
        let adjacentTrains = this.levelsMap.get(targetLevel - 1).filter((x, index) => (index == indexOfTargetTrain || index == indexOfTargetTrain + 1));

        // for each train from the target level disconnect 2 adjacent (to the target train) trains
        this.levelsMap.get(targetLevel).forEach(train => {
            train.disconnectFrom(adjacentTrains[0].id);
            SVG.find('.rails-' + adjacentTrains[0].id + '-' + train.id).remove();
            this.rails = this.rails.filter(x => !((x.startId == adjacentTrains[0].id)))

            train.disconnectFrom(adjacentTrains[1].id);
            SVG.find('.rails-' + adjacentTrains[1].id + '-' + train.id).remove();
            this.rails = this.rails.filter(x => !((x.startId == adjacentTrains[1].id)))
        })

        // connect target train with 2 adjacent trains
        targetTrain.connectWith(adjacentTrains[0], adjacentTrains[1]);

        // add rails to access them later
        let rails = [{ start: { x: adjacentTrains[0].position.x + 50, y: adjacentTrains[0].position.y }, target: targetTrain.position, startId: adjacentTrains[0].id, targetId: targetTrain.id }, { start: { x: adjacentTrains[1].position.x + 50, y: adjacentTrains[1].position.y }, target: targetTrain.position, startId: adjacentTrains[1].id, targetId: targetTrainId }];

        // if the rails aim to final station
        if (this.levelsMap.size - 1 == targetTrainId) {
            rails.push({ start: targetTrain.position, target: { x: targetTrain.position.x + 500, y: targetTrain.position.y }, startId: targetTrainId, targetId: targetTrainId })
        }

        this.drawRails(rails);

        this.rails = this.rails.concat(rails).flat();

        // draw stations new
        let trainsArr = Array.from(this.trains.values());
        let stations = trainsArr.filter(x => x instanceof (JoinedTrain));

        this.drawStations(stations);
        console.log('adjacentTrains.length '+ adjacentTrains.length);
        adjacentTrains.forEach(adjacentTrain=>{
            adjacentTrain.animatedTrains.forEach(element => {
                element.setupPath(adjacentTrain.id);
            });
        }
        );
        station.connected = true;
    }
    drawElements() {
        this.clearCanvas();
        this.draw = SVG().addTo('#canvas').size('100%', '100%');

        let trainsArr = Array.from(this.trains.values());
        let startTrains = trainsArr.filter(x => x.value);
        let stations = trainsArr.filter(x => x instanceof (JoinedTrain));

        this.drawRails(this.rails);

        this.drawTrains(startTrains);

        this.drawStations(stations);
        this.drawCows();

    }

    drawRails(rails) {
        for (let i = 0; i < rails.length; i++) {
            let start = rails[i].start;
            let target = rails[i].target;
            let startId = rails[i].startId;
            let targetId = rails[i].targetId;
            let group = this.draw.group();
            group.addClass('rails-' + startId + '-' + targetId);
            group.id('rails-' + startId);
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 20, color: '#4d4b42', linecap: "round" }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 30, color: '#4d4b42', linecap: "round", opacity: 0.7 }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 37, color: '#4d4b42', linecap: "round", opacity: 0.4 }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 39, color: '#4d4b42', linecap: "round", opacity: 0.1 }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 20, color: "#000000", dasharray: '1 4' }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 10) + ' S ' + target.x / 1.15 + ' ' + (target.y + 10) + ', ' + target.x + ' ' + (target.y + 10)).stroke({ width: 2, color: "#000000", linecap: "round" }).fill('none');
            group.path('M' + start.x + ' ' + (start.y + 20) + ' S ' + target.x / 1.15 + ' ' + (target.y + 20) + ', ' + target.x + ' ' + (target.y + 20)).stroke({ width: 2, color: "#000000" }).fill('none');

            //bottom rail
            //middle
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 1, color: "transparent", linecap: "round" }).fill('none').id('centerline' + startId);

            //top rail
            SVG.find('.station-' + targetId).before(group);
            SVG.find('.station-' + startId).before(group);
            SVG.find('.train-' + targetId).before(group);
            SVG.find('.train-' + startId).before(group);
        }
    }

    // TODO drawing trains 
    drawTrains(trains) {
        // drawing loks (https://svgjs.com/docs/3.0/getting-started/)
        for (let i = 0; i < trains.length; i++) {
            let lokOffset = 100;
            let train = trains[i];
            let x = train.position.x;
            let y = train.position.y;
            let hayToTransport=train.value;
            if(hayToTransport<0){
                hayToTransport=0;
            }
            let numberOfWagons=0;
            train.cargoTrains=[];

            while(hayToTransport>10){
                numberOfWagons++;
                hayToTransport-=10;
                let cargoGroup = this.draw.image('./assets/cart-' + 10 + '.png').height(36).width(100);
                cargoGroup.attr({ x: train.position.x + 100 - lokOffset*numberOfWagons, y: train.position.y });
                cargoGroup.css('overflow', 'visible');
                train.cargoTrains.push(cargoGroup);

                if (train instanceof JoinedTrain) {
                    cargoGroup.hide();
                }
            }
            numberOfWagons++;
            let cargoGroup;

            cargoGroup = this.draw.image('./assets/cart-' + hayToTransport + '.png').height(36).width(100);

            
            cargoGroup.attr({ x: train.position.x + 100 - lokOffset*numberOfWagons, y: train.position.y });
            cargoGroup.css('overflow', 'visible');
            train.cargoTrains.push(cargoGroup);
            //img offset
            //cargo.attr({ x:  0, y: -36});


            let group = this.draw.nested();
            group.addClass('train-' + train.id);
            group.css('overflow', 'visible')
            let lok = group.group()
            lok.css('overflow', 'visible')

            lok.image('./assets/locomotive.png').height(40).width(100);
            group.attr({ x: train.position.x + 100, y: train.position.y });
            //img offset height=36px
            //img.attr({ x:  -50, y: 0});
            let valueText = lok.group();
            //valueText.rect(20,20).fill('#ffffff').move(8,8);
            valueText.text(String(train.value)).font({
                family: 'Helvetica',
                weight: 'bold'
                , size: 16,
                anchor: 'middle'

                , leading: '1.5em', fill: '#ffffff'
            }).move(8, 8);
            train.group = group;

            if (train instanceof JoinedTrain) {
                group.hide();
                cargoGroup.hide();
            }
            train.updateAnimatedTrains();
        }
    }

    drawStations(stations) {

        for (let i = 0; i < stations.length; i++) {
            let station = stations[i];
            SVG.find('.small-station-' + station.id).remove();
            SVG.find('.big-station-' + station.id).remove();
            let group = this.draw.group();
            group.addClass('station');
            if (station.subTrains.length == 2) {
                station.bigStation = true;
                group.addClass('big-station-' + station.id);
                group.on('click', function () { this.showSignButtons(station) }.bind(this));
                group.image('assets/bigstation.svg').move(station.position.x - 70, station.position.y - 70);
                let signPosition;
                switch (station.sign) {
                    case '*': signPosition = { x: station.position.x + 39, y: station.position.y - 56 }; break;
                    case '-': signPosition = { x: station.position.x + 42, y: station.position.y - 62 }; break;
                    case '/': signPosition = { x: station.position.x + 41, y: station.position.y - 60 }; break;
                    default: signPosition = { x: station.position.x + 38, y: station.position.y - 60 };
                }
                group.text(station.sign).font({
                    family: 'Helvetica'
                    , size: 25
                    , anchor: 'start'
                    , weight: 900
                }).move(signPosition.x, signPosition.y);

            } else {
                station.bigStation = false;

                group.on('click', function () { this.connectTrains(station); }.bind(this));
                group.addClass('small-station-' + station.id);
                group.image('assets/smallstation.svg').move(station.position.x - 30, station.position.y - 30);
            }
        }
    }
    drawCows() {
        let solution = eval(this.equation);

        for (let i = 0; i < solution/2; i++) {
            let coordinates = this.getRandomCowPosition(60,95,10,20);
            this.draw.image('./assets/cow.png').dx(coordinates.x + '%').dy(coordinates.y + '%').rotate(Math.floor(Math.random() * 350));
        }
        for (let i = 0; i < solution-solution/2; i++) {
            let coordinates =  this.getRandomCowPosition(60,95,60,90);
            this.draw.image('./assets/cow.png').dx(coordinates.x + '%').dy(coordinates.y + '%').rotate(Math.floor(Math.random() * 350));
        }
    }
    getRandomCowPosition(minX,maxX,minY,maxY) {
        return { x: maxX - Math.round(Math.random() * (maxX-minX)), y: maxY - Math.round(Math.random() * (maxY-minY)) };
    };
    // TODO clear canvas
    clearCanvas() {
        $('#canvas').html("");
        $('#result').text("");
        $("#signButtons").hide();
        $("#signOverlay").hide();
    }

    // loading the next round with a new equation
    nextRound() {
        console.log("Next round")
        $("#disablingActionsOverlay").hide();
        this.loadEquation(this.equations[Math.floor((this.equations.length - 1) * Math.random() + 1)]);
    }

    // reloading the canvas
    reset() {
        this.loadEquation(this.equation);
    }

    giveHint() {
        console.log("Hint for user should be displayed!");
    }

    startPlayMode() {

        if (this.checkUnconnectedTrains(null)) {
            return;
        }
        $("#disablingActionsOverlay").show();
        $("#startButton").attr('disabled','disabled');
        $("#nextButton").attr('disabled','disabled');
        // creates now as well joined trains
        this.drawElements();

        // TODO blocking click events

        let trains = Array.from(this.trains.values());

        if ([...trains].filter(x => x instanceof JoinedTrain && x.subtrains == 0).length != 0) {
            alert("Connect all trains!");
            return;
        }

        let finalTrain = this.trains.get(this.levelsMap.size - 1),
        duration = 3500,
        delay = 0,
        totalDuration=0;
        finalTrain.finaltrain=true;

        // firstly trains from level 0 goes, later level 1, 2 ...
        for (let i = 1; i < this.levelsMap.size; i++) {
            console.log( 'moving '+this.levelsMap.get(i).length + ' joinedTrains' )
            this.levelsMap.get(i).forEach(train => {
                console.log( 'moving '+train.subTrains.length + ' subTrains' )

                train.subTrains.forEach(subtrain => {

                    subtrain.move(train.position, duration - 1500, delay);
                    $('#result').text(train.eqString);
                    console.log('Subequation: ' + train.eqString);
                });

            });
            delay += duration - 500;
            totalDuration += duration + delay;

        }
        let result = eval(this.equation);
        // check solution correctness 



        let displayPoints=this.points;

        setTimeout(function () {
            finalTrain.move({ x: finalTrain.position.x + 250, y: finalTrain.position.y }, duration, 0);

            $('.goodHay>img').css("transform", "scale(1.5)");
                setTimeout(function(){
                    $('.goodHay>img').css("transform", "scale(1)");
                    let goodHay=setGoodHay(finalTrain.value, result);
                },200)

            $('.sadcow>img').css("transform", "scale(1.5)");
            setTimeout(function(){
                let sadCows=setSadCows(finalTrain.value, result);
                displayPoints -= sadCows*5;
                setPoints(displayPoints);
                $('.sadcow>img').css("transform", "scale(1)");
                $('.happycow>img').css("transform", "scale(1.5)");
                $('.badHay>img').css("transform", "scale(1.5)");
                setTimeout(function(){
                    let badHay=setBadHay(finalTrain.value, result);
                    displayPoints -= badHay*5;

                    $('.badHay>img').css("transform", "scale(1)");
                    
                },200);
                setTimeout(function(){
                    let happyCows= setHappyCows(finalTrain.value, result);
                    if(finalTrain.value=== result){
                        displayPoints += happyCows*5;
                    }
                    $('.happycow>img').css("transform", "scale(1)");
                    setPoints(displayPoints);
                    $("#startButton").removeAttr('disabled');
                    $("#nextButton").removeAttr('disabled');

                },200);
            },200);


            


            
        }, delay);
        this.points=displayPoints;

    }

}

// version with the whole equation
class GameVersion1 extends Game {
    constructor() {
        super();

    }

    loadEquation(equation) {
        super.loadEquation(equation);
        let rightSide = equation.match(/[=].*\d+/g)[0];
        let leftSide = equation.replace(rightSide, '');
        $('#target').text(leftSide + "=" + eval(leftSide));
        $('.sadcow>p').text(eval(leftSide) + 'x').css('color','black');
        $('.goodhay>p').text('0 x').css('color','black');;
        $('.happycow>p').text('0 x').css('color','black');;
        $('.badhay>p').text('0 x').css('color','black');;
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
game.giveHint();

/*
0
   1
3     2
   4
5

such ids are needed for the correct final equation
*/