window.isPlayModeActive = false;
class Game {
    // all equations for the game TODO: Equations (numbers under 20 look still good)
equations=['(15+9)+2=26',
'(6+13)-11=8',
'(1+10)*2=22',
'(2+12)/2=7',
'(9-1)+9=17',
'(13-10)-5=-2',
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
'11+3+7+2=23',
'4+1+11-5=11',
'5+13-3*4=5',
'12+2-15/5=11',
'13+2*4+3=24',
'5+10*1-7=8',
'10-6+3+2=9',
'11-4+12-9=10',
'(3+1)*(5+2)=21',
'(7+1)*(14-12)=16',
'7+(12/3)*2=15',
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
        const positionsArray = [undefined, undefined, [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 30, y: 300 }], [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 630, y: 300 }, { x: 30, y: 300 }, { x: 330, y: 450 }, { x: 30, y: 600 }], [{ x: 30, y: 0 }, { x: 330, y: 150 }, { x: 630, y: 300 }, { x: 930, y: 450 }, { x: 30, y: 300 }, { x: 330, y: 450 }, { x: 630, y: 600 }, { x: 30, y: 600 }, { x: 330, y: 750 }, { x: 30, y: 900 }]];

        // classification to id and level for 0,1,2,3 trains (increasing from left to right)
        const classificationsArray = [undefined, undefined, [{ id: 0, level: 0 }, { id: 2, level: 0 }, { id: 1, level: 1 }], [{ id: 0, level: 0 }, { id: 3, level: 0 }, { id: 5, level: 0 }, { id: 1, level: 1 }, { id: 4, level: 1 }, { id: 2, level: 2 }], [{ id: 0, level: 0 }, { id: 4, level: 0 }, { id: 7, level: 0 }, { id: 9, level: 0 }, { id: 1, level: 1 }, { id: 5, level: 1 }, { id: 8, level: 1 }, { id: 2, level: 2 }, { id: 6, level: 2 }, { id: 3, level: 3 }]];

        
        let rightSide=equation.match(/[=].*\d+/g)[0];
        let leftSide=equation.replace(rightSide,'');
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

    setStationBlur(id,on){
        if(on){

            SVG.find('.small-station-' + id).css({
                transition: 'filter 1s easeIn',
                filter:'drop-shadow(4px 4px 10px #ff0000) drop-shadow(-4px -4px 10px #ff0000)'});

            SVG.find('.big-station-' + id).css({
                transition: 'filter 1s',
                filter:'drop-shadow(4px 4px 10px #ff0000) drop-shadow(-4px -4px 10px #ff0000)'});

        }else{
            SVG.find('.small-station-' + id).css('filter', null);
            SVG.find('.big-station-' + id).css('filter', null);
        }

    }
    checkUnconnectedTrains(station){
        let unconnectedStations=Array.from(this.trains.values());

        unconnectedStations= unconnectedStations.filter(
            i=> (i.connected==false||(i.bigStation==true&&i.sign=="")));
        if(station==undefined){
            //final station
            station=this.trains.get(this.levelsMap.size - 1);
            unconnectedStations= unconnectedStations.filter(unconnectedStation=>((unconnectedStation.level<station.level) || station.finalTrain));
        } else {
            unconnectedStations= unconnectedStations.filter(unconnectedStation=>(unconnectedStation.level<station.level));
        }
        if(unconnectedStations.length>0){
            let minLevel= Math.min(...unconnectedStations.map(unconnectedStation=>unconnectedStation.level));
            console.log(minLevel);

            //console.log(unconnectedStations);

            //console.log(minLevel);
            unconnectedStations=unconnectedStations.filter(unconnectedStation=>unconnectedStation.level==minLevel);
            unconnectedStations.forEach(unconnectedStation => this.setStationBlur(unconnectedStation.id,true));
            return true;
        }
        else return false;
    }
    connectTrains(station) {

        if(this.checkUnconnectedTrains(station)){
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
            });}
        );
        station.connected=true;
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
            group.path('M' + start.x + ' ' + (start.y + 15) + ' S ' + target.x / 1.15 + ' ' + (target.y + 15) + ', ' + target.x + ' ' + (target.y + 15)).stroke({ width: 1, color: "transparent", linecap: "round" }).fill('none').id('centerline'+startId);

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
            let lokOffset=100;
            let train = trains[i];
            let x = train.position.x;
            let y = train.position.y;
            let cargoGroup = this.draw.image('./assets/'+train.cargo);
            cargoGroup.attr({ x:  train.position.x - lokOffset, y: train.position.y });
            cargoGroup.css('overflow', 'visible');
           
                       //img offset
            //cargo.attr({ x:  0, y: -36});

            train.cargoTrains.push(cargoGroup);
            let group = this.draw.nested();
            group.addClass('train-' + train.id);
            group.css('overflow', 'visible')
            let lok = group.group()
            lok.css('overflow', 'visible')

            lok.image('./assets/lok.png');
            group.attr({ x:  train.position.x,  y: train.position.y });
            //img offset height=36px
            //img.attr({ x:  -50, y: 0});
            let valueText=lok.group();
            //valueText.rect(20,20).fill('#ffffff').move(8,8);
            valueText.text(String(train.value)).font({
                family: 'Helvetica',
                weight: 'bold'
                , size: 16,
                 anchor:   'middle'

                , leading: '1.5em',fill: '#ffffff'
            }).move(8,8);
            train.group=group;

            if (train instanceof JoinedTrain) {
                group.hide();
                cargoGroup.hide();
            }
            train.updateAnimatedTrains();
        }
    }

    drawStations(stations) {
        let stationSmallSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="105px" height="69px" viewBox="-0.5 -0.5 105 69"><defs/><g><rect x="4" y="32.4" width="96" height="36" fill="#d9c4a0" stroke="none" pointer-events="all"/><path d="M 0 40.4 L 8 12.4 L 96 12.4 L 104 40.4 Z" fill="#3d2a26" stroke="none" pointer-events="all"/><path d="M 39.6 -22 L 63.6 12 L 39.6 46 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,51.6,12)" pointer-events="all"/><ellipse cx="51.6" cy="24.4" rx="10" ry="10" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="40.9" y="13.9" width="21.4" height="21" fill="none" stroke="none" pointer-events="all"/><path d="M 56.44 28.05 C 56.64 28.22 56.67 28.54 56.46 28.78 C 56.3 28.94 56.01 29.03 55.77 28.86 L 51.09 25.34 C 50.99 25.23 50.89 25.13 50.9 24.91 L 50.9 17.22 C 50.9 16.91 51.18 16.7 51.44 16.7 C 51.77 16.7 51.97 17 51.97 17.22 L 51.97 24.68 Z M 51.65 33.16 C 56.93 33.16 60.52 28.8 60.52 24.41 C 60.52 19.07 56.04 15.65 51.63 15.65 C 45.77 15.65 42.69 20.63 42.69 24.17 C 42.69 30.13 47.52 33.16 51.65 33.16 Z M 51.55 34.9 C 46.27 34.9 41.03 30.94 40.9 24.28 C 40.9 19.17 45.28 13.9 51.56 13.9 C 57.08 13.9 62.3 18.1 62.3 24.46 C 62.3 30.1 57.66 34.9 51.55 34.9 Z" fill="#000000" stroke="none" pointer-events="all"/><rect x="68" y="44.4" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="84" y="44.4" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><path d="M 39.6 47.2 Q 64.4 47.2 64.4 56 Q 64.4 64.8 39.6 64.8 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,52,56)" pointer-events="all"/><rect x="12" y="44" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="28" y="44" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/></g></svg>';
        let stationBigSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="157px" height="111px" viewBox="-0.5 -0.5 157 111"><defs/><g><path d="M 102.04 -11.27 L 129.94 13.85 L 102.04 38.97 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,115.99,13.85)" pointer-events="all"/><rect x="84" y="41.6" width="64" height="68" fill="#d9c4a0" stroke="none" pointer-events="all"/><rect x="4" y="73.6" width="80.4" height="36" fill="#d9c4a0" stroke="none" pointer-events="all"/><path d="M 76 45.6 L 84 25.6 L 148 25.6 L 156 45.6 Z" fill="#3d2a26" stroke="none" pointer-events="all"/><ellipse cx="116" cy="28.2" rx="13.200000000000001" ry="13.200000000000001" fill="#ffffff" stroke="#000000" stroke-width="2" pointer-events="all"/><path d="M 0 81.6 L 8 61.6 L 84.4 61.6 L 92.4 81.6 Z" fill="#3d2a26" stroke="none" pointer-events="all"/><rect x="112" y="53.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="96" y="53.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="128" y="53.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="91.6" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="132" y="85.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="112" y="85.2" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="27.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="75.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="43.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="59.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><path d="M 102 85.6 Q 130 85.6 130 95.6 Q 130 105.6 102 105.6 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,116,95.6)" pointer-events="all"/><rect x="12" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/></g></svg>';

        for (let i = 0; i < stations.length; i++) {
            let station = stations[i];
            SVG.find('.small-station-' + station.id).remove();
            SVG.find('.big-station-' + station.id).remove();
            let group = this.draw.group();
            group.addClass('station');
            if (station.subTrains.length == 2) {
                station.bigStation=true;
                group.addClass('big-station-' + station.id);
                group.on('click', function () { this.showSignButtons(station) }.bind(this));
                group.svg(stationBigSVG).move(station.position.x - 70, station.position.y - 70);
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
                station.bigStation=false;

                group.on('click', function () { this.connectTrains(station); }.bind(this));
                group.addClass('small-station-' + station.id);
                group.svg(stationSmallSVG).move(station.position.x - 30, station.position.y - 30);
            }
        }
    }
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

    startStopPlayMode() {
        if(window.isPlayModeActive) {
            this.stopPlayMode();
        } else {
            this.startPlayMode();
        }
    }

    stopPlayMode() {
        window.isPlayModeActive = !window.isPlayModeActive;
        $("#startStopButton")[0].innerText = "Los geht's";
        $("#disablingActionsOverlay").hide();
        this.drawElements();
    }

    startPlayMode() {
        let finalTrain = this.trains.get(this.levelsMap.size - 1),
        duration = 3500,
        delay = 0,
        totalDuration=0;
        finalTrain.finalTrain=true;

        // check if everything is connected
        if(this.checkUnconnectedTrains()){
            return;
        }
        
        window.isPlayModeActive = !window.isPlayModeActive;

        $("#startStopButton")[0].innerText = "Anhalten";
        
        // blocking click events
        $("#disablingActionsOverlay").show();

        // creates now as well joined trains
        this.drawElements();

        // firstly trains from level 0 goes, later level 1, 2 ...
        for (let i = 1; i < this.levelsMap.size; i++) {
            console.log( 'moving '+this.levelsMap.get(i).length + ' joinedTrains' )
            this.levelsMap.get(i).forEach(train => {
                console.log( 'moving '+train.subTrains.length + ' subTrains' )
                train.subTrains.forEach(subtrain => {
                    subtrain.move(delay);
                    $('#result').text(train.eqString);
                    console.log('Subequation: ' + train.eqString);
                });

            });
            delay += duration - 500;
            totalDuration+=duration+delay;
        }
        let result="";
        // check solution correctness 
        if (eval(this.equation) == finalTrain.value) {
            this.points = this.points + 10;
            result="Correct!";
            console.log("Correct!");
            // TODO feedback popup 
        } else {
            result="Incorrect!";
            console.log("Incorrect!");
            // TODO explosion
        }

        let points = this.points;

        setTimeout(function () {
            if(window.isPlayModeActive) {
                finalTrain.move({ x: finalTrain.position.x + 250, y: finalTrain.position.y }, duration, 0);
                $('#result').append("=" + finalTrain.value);
                $('#points').text(points);
                setTimeout(function(){
                    alert(result);
                },duration);
            }
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
        let rightSide=equation.match(/[=].*\d+/g)[0];
        let leftSide=equation.replace(rightSide,'');
        $('#target').text(leftSide + "=" + eval(leftSide));
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