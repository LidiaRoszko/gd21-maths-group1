window.timestamp; // time of last play mode

class Game {
    // all equations for the game TODO: Equations (numbers under 20 look still good)
   equations = [[
       //level 1
'(    15    +    9    )    +    2    =    26',
'(    6    +    13    )    -    11    =    8',
'(    1    +    10    )    *    2    =    22',
'(    2    +    12    )    /    2    =    7',
'(    9    -    1    )    +    9    =    17',
'(    13    -    10    )    -    5    =    -2',
'(    14    -    8    )    *    4    =    24',
'(    11    -    3    )    /    4    =    2',
'(    2    *    6    )    +    10    =    22',
'(    1    *    15    )    -    7    =    8',
'(    4    *    3    )    *    2    =    24',
'(    9    *    6    )    /    3    =    18',
'(    14    /    7    )    +    5    =    7',
'(    18    /    3    )    -    2    =    4',
'(    16    /    4    )    *    5    =    20',
'(    27    /    3    )    /    3    =    3',
'6    +    (    8    +    4    )    =    18',
'3    +    (    7    -    2    )    =    8',
'5    +    (    3    *    5    )    =    20',
'7    +    (    10    /    2    )    =    12',
'10    -    (    1    +    6    )    =    3',
'8    -    (    10    -    8    )    =    6',
'15    -    (    3    *    2    )    =    9',
'13    -    (    6    /    3    )    =    11',
'5    *    (    1    +    4    )    =    25',
'12    *    (    9    -    7    )    =    24',
'5    *    (    3    *    2    )    =    30',
'12    *    (    12    /    6    )    =    24',
'12    /    (    2    +    1    )    =    4',
'15    /    (    6    -    3    )    =    5',
'24    /    (    2    *    3    )    =    4',
'30    /    (    8    /    4    )    =    15'],
//level 2
[
    '3    +    12    +    10    =    25',
    '8    +    14    -    3    =    19',
    '5    +    8    *    2    =    11',
    '12    +    9    /    3    =    15',
    '10    -    6    +    13    =    17',
    '15    -    4    -    5    =    6',
    '20    -    6    *    3    =    2',
    '19    -    12    /    4    =    16',
    '13    *    2    +    2    =    28',
    '4    *    5    -    13    =    7',
    '2    *    3    *    3    =    18',
    '3    *    4    /    2    =    6',
    '14    /    7    +    25    =    27',
    '15    /    3    -    4    =    1',
    '3    +    2    +    14    =    19',
    '26    +    3    -    18    =    11',
    '22    +    4    *    2    =    30',
    '1    +    8    /    4    =    3',
    '17    -    15    +    28    =    30',
    '26    -    8    -    13    =    5',
    '24    -    4    *    5    =    4',
    '22    -    18    /    6    =    19',
    '2    *    6    +    14    =    26',
    '3    *    8    -    4    =    20',
    '4    *    3    *    2    =    24',
    '4    *    9    /    3    =    12',
    '20    /    4    +    5    =    10',
    '30    /    3    -    2    =    8',
]
];

    // points received in total
    points = 0;
    level = 0; 
    streak=0;
    badStreak=0;
    streakthreshold=[2,3]
    /* equation specific params */

    // possible trains
    trains = new Map;

    // current equation
    equation = "";

    // for each level trains assigned 
    levelsMap = new Map;

    isPlayModeActive = false;

    cowsPositions = [];

    draw;

    rails = [];

    currentLevel = 1;
    constructor() {
        $("#infoOverlay").show();
        this.createSignButtons();
        this.loadEquation(this.equations[this.level][Math.floor(Math.random() * this.equations[this.level].length)]);
    }

    // creating sign buttons for every possible station (max for 4 start trains -> 10 stations)
    createSignButtons() {
        let gameHTML = $(".game");
        let signButtonsHTML = $(".sign-buttons");

        for (let i = 0; i < 10; i++) {
            let clone = signButtonsHTML.clone().attr("id", "signButtons" + i);
            clone.appendTo(gameHTML);

            $("#signButtons" + i + " .plus-button").click(function () { this.chooseSign(i, '+') }.bind(this));
            $("#signButtons" + i + " .minus-button").click(function () { this.chooseSign(i, '-') }.bind(this));
            $("#signButtons" + i + " .star-button").click(function () { this.chooseSign(i, '*') }.bind(this));
            $("#signButtons" + i + " .slash-button").click(function () { this.chooseSign(i, '/') }.bind(this));
        }
    }

    // information about game
    hideStartInformation() {
        $("#infoOverlay").hide();
    }

    // after final train shown feedback
    showFeedback(result) {
        let correctValue = eval(this.equation);
        let text = ""
        if (correctValue == result) {
            text = result + " ist korrekt! Die Kühe sind zufrieden!";
            $("#happyCow").show();
            $('#startStopButton').hide();
        } else if (correctValue > result) {
            text = result + " stimmt leider nicht! Einige Kühe bleiben Hungrig";
            $("#sadCow").show();
        } else {
            text = result + " stimmt leider nicht! Du hast zuviel geliefert und das Heu ist schlecht geworden.";
            $("#illCow").show();
        }
        $('#feedbackOverlay>.feedBackContainer>p').text(text);
        //$("#disablingActionsOverlay").show();
        $('#feedbackOverlay').show();
        $('#feedbackNextButton').show();

    }

    // loading of an equation & drawing trains and stations
    loadEquation(equation) {
        console.log(equation);

        this.levelsMap = new Map;
        this.trains = new Map;
        this.rails = [];

        var xOffset = 80;
        var yOffset = 14;
        var xInterval = 280;
        var yInterval = 196;

        // positions for 0,1,2,3 trains
        const positionsArray = [undefined, undefined, [{ x: xInterval * 0 + xOffset, y: yInterval * 0 + yOffset }, { x: xInterval * 1 + xOffset, y: yInterval * 1.5 + yOffset }, { x: xInterval * 0 + xOffset, y: yInterval * 1 + yOffset }], [{ x: xInterval * 0 + xOffset, y: yInterval * 0 + yOffset }, { x: xInterval * 1 + xOffset, y: yInterval * 0.5 + yOffset }, { x: xInterval * 2 + xOffset, y: yInterval * 1 + yOffset }, { x: xInterval * 0 + xOffset, y: yInterval * 1 + yOffset }, { x: xInterval * 1 + xOffset, y: yInterval * 1.5 + yOffset }, { x: xInterval * 0 + xOffset, y: yInterval * 2 + yOffset }], [{ x: xInterval * 0 + xOffset, y: yInterval * 0 + yOffset }, { x: xInterval * 1 + xOffset, y: yInterval * 0.5 + yOffset }, { x: xInterval * 2 + xOffset, y: yInterval * 1 + yOffset }, { x: xInterval * 3 + xOffset, y: yInterval * 1.5 + yOffset }, { x: xInterval * 0 + xOffset, y: yInterval * 1 + yOffset }, { x: xInterval * 1 + xOffset, y: yInterval * 1.5 + yOffset }, { x: xInterval * 2 + xOffset, y: yInterval * 2 + yOffset }, { x: xInterval * 0 + xOffset, y: yInterval * 2 + yOffset }, { x: xInterval * 1 + xOffset, y: yInterval * 2.5 + yOffset }, { x: xInterval * 0 + xOffset, y: yInterval * 3 + yOffset }]];

        // classification to id and level for 0,1,2,3 trains (increasing from left to right)
        const classificationsArray = [undefined, undefined, [{ id: 0, level: 0 }, { id: 2, level: 0 }, { id: 1, level: 1 }], [{ id: 0, level: 0 }, { id: 3, level: 0 }, { id: 5, level: 0 }, { id: 1, level: 1 }, { id: 4, level: 1 }, { id: 2, level: 2 }], [{ id: 0, level: 0 }, { id: 4, level: 0 }, { id: 7, level: 0 }, { id: 9, level: 0 }, { id: 1, level: 1 }, { id: 5, level: 1 }, { id: 8, level: 1 }, { id: 2, level: 2 }, { id: 6, level: 2 }, { id: 3, level: 3 }]];


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
    chooseSign(chosenStationId, sign) {

        let trainsArr = Array.from(this.trains.values());
        let stations = trainsArr.filter(x => x instanceof (JoinedTrain));

        let chosenStation = stations.filter(x => x.id == chosenStationId)[0];

        if (!chosenStation.bigStation) {
            this.connectTrains(chosenStation);
        }

        if (this.checkUnconnectedTrains(chosenStation)) {
            return;
        }

        chosenStation.updateSign(sign);
        this.setStationBlur(chosenStationId, false);

        this.drawStations(stations);
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
        let unconnectedStations = Array.from(this.trains.values());

        unconnectedStations = unconnectedStations.filter(
            i => (i.connected == false || (i.bigStation == true && i.sign == "")));
        if (station == undefined) {
            //final station
            station = this.trains.get(this.levelsMap.size - 1);
            unconnectedStations = unconnectedStations.filter(unconnectedStation => ((unconnectedStation.level < station.level) || station.finalTrain));
        } else {
            unconnectedStations = unconnectedStations.filter(unconnectedStation => (unconnectedStation.level < station.level));
        }
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
        this.levelsMap.get(station.level).forEach(stationAtLevel => {
            if (!stationAtLevel.connected) {
                this.connectStation(stationAtLevel)
            }
        }
        );
        this.connectStation(station);
    }

    connectStation(station) {
        let targetTrainId = station.id;
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
        station.connected = true;
    }

    drawElements() {
        this.clearCanvas();
        this.draw = SVG().addTo('#canvas').size('100%', '100%');

        let trainsArr = Array.from(this.trains.values());
        let startTrains = trainsArr.filter(x => (x.value !== undefined && x.value !== NaN));
        let stations = trainsArr.filter(x => x instanceof (JoinedTrain));

        this.drawRails(this.rails);

        this.drawTrains(startTrains);

        this.drawStations(stations);

        this.drawCows();
    }

    drawCows() {
        let cowSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="50px" height="35px" viewBox="-0.5 -0.5 445 344"><defs/><g><path d="M 419.32 218.52 L 432 230" fill="none" stroke="#f5f5f5" stroke-width="12" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 132 90 Q 332 90 332 230 Q 332 370 132 370 Z" fill="#f5f5f5" stroke="none" transform="rotate(270,232,230)" pointer-events="all"/><path d="M 132 0 Q 158 0 158 45 Q 158 90 132 90 Q 145 45 132 0 Z" fill="#ffce9f" stroke="none" transform="translate(145,0)scale(-1,1)translate(-145,0)" pointer-events="all"/><path d="M 66 2 Q 92 2 92 47 Q 92 92 66 92 Q 79 47 66 2 Z" fill="#ffce9f" stroke="none" pointer-events="all"/><ellipse cx="36" cy="58" rx="30" ry="20" fill="#4a4a4a" stroke="none" transform="rotate(25,36,58)" pointer-events="all"/><ellipse cx="112" cy="131" rx="80" ry="99" fill="#f5f5f5" stroke="none" pointer-events="all"/><path d="M 57 85 C 37 85 32 120 48 127 C 32 142.4 50 176 63 162 C 72 190 102 190 112 162 C 132 162 132 134 119.5 120 C 132 92 112 64 94.5 78 C 82 57 62 57 57 85 Z" fill="#4a4a4a" stroke="none" pointer-events="all"/><ellipse cx="112" cy="193" rx="80" ry="43" fill="#ffcce6" stroke="none" pointer-events="all"/><ellipse cx="79" cy="185" rx="13" ry="13" fill="#000000" stroke="none" pointer-events="all"/><ellipse cx="145" cy="185" rx="13" ry="13" fill="#000000" stroke="none" pointer-events="all"/><ellipse cx="79" cy="110" rx="13" ry="20" fill="#000000" stroke="#000000" stroke-width="2" pointer-events="all"/><ellipse cx="145" cy="110" rx="13" ry="20" fill="#000000" stroke="#000000" stroke-width="2" pointer-events="all"/><ellipse cx="182" cy="56" rx="30" ry="20" fill="#f5f5f5" stroke="none" transform="rotate(325,182,56)" pointer-events="all"/><path d="M 227 171.5 C 207 171.5 202 185 218 187.7 C 202 193.64 220 206.6 233 201.2 C 242 212 272 212 282 201.2 C 302 201.2 302 190.4 289.5 185 C 302 174.2 282 163.4 264.5 168.8 C 252 160.7 232 160.7 227 171.5 Z" fill="#4a4a4a" stroke="none" pointer-events="all"/><path d="M 122.08 255.8 C 102.08 255.8 97.08 273.3 113.08 276.8 C 97.08 284.5 115.08 301.3 128.08 294.3 C 137.08 308.3 167.08 308.3 177.08 294.3 C 197.08 294.3 197.08 280.3 184.58 273.3 C 197.08 259.3 177.08 245.3 159.58 252.3 C 147.08 241.8 127.08 241.8 122.08 255.8 Z" fill="#4a4a4a" stroke="none" transform="rotate(38,147.08,273.3)" pointer-events="all"/><path d="M 264.74 248.74 C 244.74 248.74 239.74 273.31 255.74 278.23 C 239.74 289.04 257.74 312.63 270.74 302.8 C 279.74 322.46 309.74 322.46 319.74 302.8 C 339.74 302.8 339.74 283.14 327.24 273.31 C 339.74 253.65 319.74 233.99 302.24 243.82 C 289.74 229.08 269.74 229.08 264.74 248.74 Z" fill="#4a4a4a" stroke="none" transform="rotate(-60,289.74,273.31)" pointer-events="all"/><path d="M 398.72 225.86 Q 438.72 225.86 438.72 239.63 Q 438.72 253.4 398.72 253.4 Z" fill="#4a4a4a" stroke="none" transform="rotate(130,418.72,239.63)" pointer-events="all"/><path d="M 365.28 312.8 L 406.9 255.82" fill="none" stroke="#f5f5f5" stroke-width="12" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 104 282 Q 140 282 140 312 Q 140 342 104 342 Z" fill="#ffce9f" stroke="none" transform="rotate(270,122,312)" pointer-events="all"/><path d="M 170 282 Q 206 282 206 312 Q 206 342 170 342 Z" fill="#ffce9f" stroke="none" transform="rotate(270,188,312)" pointer-events="all"/><path d="M 324 282 Q 360 282 360 312 Q 360 342 324 342 Z" fill="#ffce9f" stroke="none" transform="rotate(270,342,312)" pointer-events="all"/><path d="M 258 282 Q 294 282 294 312 Q 294 342 258 342 Z" fill="#ffce9f" stroke="none" transform="rotate(270,276,312)" pointer-events="all"/></g></svg>';
        let group = this.draw.group();
        let eqValue = eval(this.equation);
        if (this.cowsPositions.length != eqValue) {
            this.cowsPositions = [];
            for (let j = 0; j < eqValue; j++) {
                this.cowsPositions.push({ 'x': Math.floor(700 + 450 * Math.random()), 'y': Math.floor(5 + 100 * Math.random()) });
            }
        }
        // drawing cow
        for (let j = 0; j < eqValue; j++) {
            let cowPosition = this.cowsPositions[j];
            group.add(SVG(cowSVG).move(cowPosition.x, cowPosition.y))
        }
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
            group.path('M' + (start.x + 35) + ' ' + (start.y + 35) + ', ' + target.x + ' ' + (target.y + 35)).stroke({ width: 10, color: '#4d4b42', linecap: "round" }).fill('none');
            group.path('M' + (start.x + 35) + ' ' + (start.y + 35) + ', ' + target.x + ' ' + (target.y + 35)).stroke({ width: 20, color: '#4d4b42', linecap: "round", opacity: 0.7 }).fill('none');
            group.path('M' + (start.x + 35) + ' ' + (start.y + 35) + ', ' + target.x + ' ' + (target.y + 35)).stroke({ width: 27, color: '#4d4b42', linecap: "round", opacity: 0.4 }).fill('none');
            group.path('M' + (start.x + 35) + ' ' + (start.y + 35) + ', ' + target.x + ' ' + (target.y + 35)).stroke({ width: 29, color: '#4d4b42', linecap: "round", opacity: 0.1 }).fill('none');
            group.path('M' + (start.x + 35) + ' ' + (start.y + 35) + ', ' + target.x + ' ' + (target.y + 35)).stroke({ width: 13, color: "#000000", dasharray: '2 4' }).fill('none');
            group.path('M' + (start.x + 35) + ' ' + (start.y + 40) + ', ' + target.x + ' ' + (target.y + 40)).stroke({ width: 2, color: "#000000", linecap: "round" }).fill('none').addClass("path-" + startId);
            group.path('M' + (start.x + 35) + ' ' + (start.y + 30) + ', ' + target.x + ' ' + (target.y + 30)).stroke({ width: 2, color: "#000000" }).fill('none');
            group.path('M' + (start.x + 35) + ' ' + (start.y + 25) + ', ' + target.x + ' ' + (target.y + 25)).stroke({ width: 1, color: "transparent", linecap: "round" }).fill('none');

            SVG.find('.station-' + targetId).before(group);
            SVG.find('.station-' + startId).before(group);
            SVG.find('.train-' + targetId).before(group);
            SVG.find('.train-' + startId).before(group);
        }
    }

    drawTrains(trains) {
        let lokSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="155px" height="53px" viewBox="-0.5 -0.5 275 95"><defs/><g><rect x="189.5" y="29" width="8" height="13" rx="1.2" ry="1.2" fill="#000000" stroke="none" pointer-events="all"/><rect x="118" y="0" width="73" height="10" rx="5" ry="5" fill="#333333" stroke="none" pointer-events="all"/><rect x="241.5" y="68" width="14" height="24" fill="#333333" stroke="#000000" pointer-events="all"/><path d="M 235 92 L 255 72 L 265 72 L 245 92 Z" fill="#333333" stroke="#000000" stroke-miterlimit="10" transform="translate(250,0)scale(-1,1)translate(-250,0)" pointer-events="all"/><path d="M 223 49 L 232 19 L 237 19 L 246 49 Z" fill="#333333" stroke="none" transform="rotate(180,234.5,34)" pointer-events="all"/><path d="M 244 92 L 264 72 L 274 72 L 254 92 Z" fill="#333333" stroke="#000000" stroke-miterlimit="10" transform="translate(259,0)scale(-1,1)translate(-259,0)" pointer-events="all"/><rect x="232" y="39" width="30" height="40" rx="15" ry="15" fill="#333333" stroke="none" pointer-events="all"/><rect x="132" y="39" width="120" height="40" rx="3.6" ry="3.6" fill="#cc0000" stroke="none" pointer-events="all"/><rect x="126" y="9" width="56" height="70" fill="#333333" stroke="none" pointer-events="all"/><rect x="137.5" y="16" width="33" height="27" rx="2.97" ry="2.97" fill="#d4e1f5" stroke="none" pointer-events="all"/><ellipse cx="152" cy="73" rx="20" ry="20" fill="#000000" stroke="#000000" pointer-events="all"/><ellipse cx="206" cy="83" rx="10" ry="10" fill="#333333" stroke="none" pointer-events="all"/><ellipse cx="184" cy="83" rx="10" ry="10" fill="#333333" stroke="none" pointer-events="all"/><ellipse cx="228" cy="83" rx="10" ry="10" fill="#333333" stroke="none" pointer-events="all"/><ellipse cx="152" cy="73" rx="15.499999999999998" ry="15.499999999999998" fill="#666666ff" stroke="none" pointer-events="all"/><ellipse cx="184" cy="83" rx="5" ry="5" fill="#000000" stroke="#000000" pointer-events="all"/><ellipse cx="206" cy="83" rx="5" ry="5" fill="#000000" stroke="#000000" pointer-events="all"/><ellipse cx="228" cy="83" rx="5" ry="5" fill="#000000" stroke="#000000" pointer-events="all"/><rect x="178" y="81" width="50" height="4" fill="#000000" stroke="none" pointer-events="all"/><path d="M 136.5 73 L 167.5 73" fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 152 57.5 L 152 88.5" fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 146.34 67.34 L 162.96 83.96" fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 141.04 83.96 L 162.96 62.04" fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 141.04 62.04 L 157.66 78.66" fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" pointer-events="stroke"/><ellipse cx="152" cy="73" rx="8" ry="8" fill="#000000" stroke="#000000" pointer-events="all"/><rect x="151" y="76" width="28" height="4" fill="#000000" stroke="none" transform="rotate(20,165,78)" pointer-events="all"/><rect x="223" y="12" width="23" height="11" rx="1.65" ry="1.65" fill="#cc0000" stroke="none" pointer-events="all"/><path d="M 190 22 Q 197 22 197 27.5 Q 197 33 190 33 Z" fill="#000000" stroke="none" transform="rotate(270,193.5,27.5)" pointer-events="all"/><rect x="0" y="39" width="120" height="41" rx="3.69" ry="3.69" fill="#666666" stroke="none" pointer-events="all"/><ellipse cx="102" cy="82" rx="10" ry="10" fill="#333333" stroke="none" pointer-events="all"/><ellipse cx="102" cy="82" rx="5" ry="5" fill="#000000" stroke="#000000" pointer-events="all"/><ellipse cx="18" cy="82" rx="10" ry="10" fill="#333333" stroke="none" pointer-events="all"/><ellipse cx="18" cy="82" rx="5" ry="5" fill="#000000" stroke="#000000" pointer-events="all"/><ellipse cx="38" cy="82" rx="10" ry="10" fill="#333333" stroke="none" pointer-events="all"/><ellipse cx="38" cy="82" rx="5" ry="5" fill="#000000" stroke="#000000" pointer-events="all"/><ellipse cx="82" cy="82" rx="10" ry="10" fill="#333333" stroke="none" pointer-events="all"/><ellipse cx="82" cy="82" rx="5" ry="5" fill="#000000" stroke="#000000" pointer-events="all"/></g></svg>';
        let haySVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="16px" height="16px" viewBox="-0.5 -0.5 16 16" style="background-color: rgb(255, 255, 255);"><defs/><g><ellipse cx="8" cy="8" rx="7.5" ry="7.5" fill="none" stroke="#BAA80B" stroke-dasharray="1 2" pointer-events="all"/><ellipse cx="8" cy="8" rx="7.5" ry="7.5" fill="#dbc60d" stroke="#BAA80B" pointer-events="all"/><ellipse cx="8" cy="8" rx="5" ry="5" fill="none" stroke="#A6960A" pointer-events="all"/><ellipse cx="8" cy="8" rx="2" ry="2" fill="none" stroke="#A6960A" pointer-events="all"/><ellipse cx="8" cy="8" rx="3.75" ry="3.75" fill="none" stroke="#A6960A" pointer-events="all"/><ellipse cx="8" cy="8" rx="0.625" ry="0.625" fill="none" stroke="#A6960A" pointer-events="all"/></g></svg>';

        for (let i = 0; i < trains.length; i++) {
            let train = trains[i];
            let x = train.position.x;
            let y = train.position.y;
            let group = this.draw.group();

            let j = (Number(train.value) > 10) ? 10 : Number(train.value);

            // drawing hay
            for (j; j > 0; j--) {
                var xOffset = 3;
                var yOffset = 13;
                var radius = 15;
                if (j == 1 || j == 2 || j == 3 || j == 4) {
                    xOffset = 3 + radius * ((j - 1) % 4);
                }
                else if (j == 5 || j == 6 || j == 7) {
                    yOffset = yOffset - radius / 2;
                    xOffset = xOffset + radius / 2 + radius * (j % 5);
                } else if (j == 8 || j == 9) {
                    yOffset = yOffset - radius;
                    xOffset = xOffset + radius + radius * (j % 8);
                } else {
                    yOffset = yOffset - 1.5 * radius;
                    xOffset = xOffset + 1.5 * radius;
                }
                group.add(SVG(haySVG).move(xOffset, yOffset))
            }
            group.addClass('train-' + train.id);
            group.svg(lokSVG).translate(x, y);

            group.text(String(train.value)).font({
                family: 'Helvetica'
                , size: 17
                , anchor: 'middle'
                , leading: '1.5em'
            }).fill("#fff").translate(32, 14);

            if (train instanceof JoinedTrain) {
                group.hide();
            } else {
                group.translate(- 65, -5);
            }
        }
    }

    drawStations(stations) {
        let stationSmallSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="110px" height="70px" viewBox="-0.5 -0.5 105 69"><defs/><g><rect x="4" y="32.4" width="96" height="36" fill="#9e5a33" stroke="none" pointer-events="all"/><path d="M 0 40.4 L 8 12.4 L 96 12.4 L 104 40.4 Z" fill="#3d2a26" stroke="none" pointer-events="all"/><path d="M 39.6 -22 L 63.6 12 L 39.6 46 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,51.6,12)" pointer-events="all"/><ellipse cx="51.6" cy="24.4" rx="10" ry="10" fill="#ffffff" stroke="#000000" pointer-events="all"/><rect x="40.9" y="13.9" width="21.4" height="21" fill="none" stroke="none" pointer-events="all"/><path d="M 56.44 28.05 C 56.64 28.22 56.67 28.54 56.46 28.78 C 56.3 28.94 56.01 29.03 55.77 28.86 L 51.09 25.34 C 50.99 25.23 50.89 25.13 50.9 24.91 L 50.9 17.22 C 50.9 16.91 51.18 16.7 51.44 16.7 C 51.77 16.7 51.97 17 51.97 17.22 L 51.97 24.68 Z M 51.65 33.16 C 56.93 33.16 60.52 28.8 60.52 24.41 C 60.52 19.07 56.04 15.65 51.63 15.65 C 45.77 15.65 42.69 20.63 42.69 24.17 C 42.69 30.13 47.52 33.16 51.65 33.16 Z M 51.55 34.9 C 46.27 34.9 41.03 30.94 40.9 24.28 C 40.9 19.17 45.28 13.9 51.56 13.9 C 57.08 13.9 62.3 18.1 62.3 24.46 C 62.3 30.1 57.66 34.9 51.55 34.9 Z" fill="#000000" stroke="none" pointer-events="all"/><rect x="68" y="44.4" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="84" y="44.4" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><path d="M 39.6 47.2 Q 64.4 47.2 64.4 56 Q 64.4 64.8 39.6 64.8 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,52,56)" pointer-events="all"/><rect x="12" y="44" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="28" y="44" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/></g></svg>';
        let stationBigSVG = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="160px" height="125px" viewBox="-0.5 -0.5 157 111"><defs/><g><path d="M 102.04 -11.27 L 129.94 13.85 L 102.04 38.97 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,115.99,13.85)" pointer-events="all"/><rect x="84" y="41.6" width="64" height="68" fill="#9e5a33" stroke="none" pointer-events="all"/><rect x="4" y="73.6" width="80.4" height="36" fill="#9e5a33" stroke="none" pointer-events="all"/><path d="M 76 45.6 L 84 25.6 L 148 25.6 L 156 45.6 Z" fill="#3d2a26" stroke="none" pointer-events="all"/><ellipse cx="116" cy="28.2" rx="13.200000000000001" ry="13.200000000000001" fill="#ffffff" stroke="#000000" stroke-width="2" pointer-events="all"/><path d="M 0 81.6 L 8 61.6 L 84.4 61.6 L 92.4 81.6 Z" fill="#3d2a26" stroke="none" pointer-events="all"/><rect x="112" y="53.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="96" y="53.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="128" y="53.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="91.6" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="132" y="85.6" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="112" y="85.2" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="27.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="75.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="43.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><rect x="59.2" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/><path d="M 102 85.6 Q 130 85.6 130 95.6 Q 130 105.6 102 105.6 Z" fill="#3d2a26" stroke="none" transform="rotate(-90,116,95.6)" pointer-events="all"/><rect x="12" y="84.8" width="8" height="12" rx="1.2" ry="1.2" fill="#dae8fc" stroke="none" pointer-events="all"/></g></svg>';

        for (let i = 0; i < stations.length; i++) {
            let station = stations[i];
            SVG.find('.small-station-' + station.id).remove();
            SVG.find('.big-station-' + station.id).remove();
            let group = this.draw.group();
            group.addClass('station');
            if (station.subTrains.length == 2) {
                station.bigStation = true;
                group.addClass('big-station-' + station.id);
                group.svg(stationBigSVG).move(station.position.x - 40, station.position.y - 55);
                let signPosition;
                let firefoxYOffset = (navigator.userAgent.indexOf("Firefox") != -1) ? 4 : 0; // signs in firefox are too high
                switch (station.sign) {
                    case '*': signPosition = { x: station.position.x + 71, y: station.position.y - 40 + firefoxYOffset }; break;
                    case '-': signPosition = { x: station.position.x + 74, y: station.position.y - 47 + firefoxYOffset }; break;
                    case '/': signPosition = { x: station.position.x + 73, y: station.position.y - 45 + firefoxYOffset }; break;
                    default: signPosition = { x: station.position.x + 70, y: station.position.y - 45 + firefoxYOffset };
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
                group.svg(stationSmallSVG).translate(station.position.x - 10, station.position.y - 10);
            }

            // positioning and displaying sign buttons
            $("#signButtons" + station.id).css("top", station.position.y + 60);
            $("#signButtons" + station.id).css("left", station.position.x - 100);
            $("#signButtons" + station.id).show();
        }
    }

    clearCanvas() {
        $('#canvas').html("");
        $(".sign-buttons").hide();

        $("#sadCow").hide();
        $("#illCow").hide();
        $("#happyCow").hide();
        $('#startStopButton').show();
    }

    // loading the next round with a new equation
    nextRound() {
        console.log("Next round")
        this.stopPlayMode();
        //$("#disablingActionsOverlay").hide();
        this.loadEquation(this.equations[this.level][Math.floor((this.equations[this.level].length - 1) * Math.random() + 1)]);
    }

    // reloading the canvas
    reset() {
        this.stopPlayMode();
        this.loadEquation(this.equation);
    }

    giveHint() {
        console.log("Hint for user should be displayed!");
    }

    startStopPlayMode() {
        if (this.isPlayModeActive) {
            this.stopPlayMode();
        } else {
            this.startPlayMode();
        }
    }

    stopPlayMode() {
        window.timestamp = new Date;
        this.isPlayModeActive = false;
        $("#startStopButton")[0].innerText = "Los geht's";
        $("#disablingActionsOverlay").hide();
        $('#feedbackOverlay').hide();
        $('#feedbackNextButton').hide();

        this.drawElements();
    }

    startPlayMode() {
        let finalTrain = this.trains.get(this.levelsMap.size - 1),
            duration = 3500,
            delay = 0,
            totalDuration = 0;
        finalTrain.finalTrain = true;
        finalTrain.calculate();

        // check if everything is connected
        if (this.checkUnconnectedTrains()) {
            return;
        }

        window.timestamp = new Date;
        let localTimeStamp = window.timestamp;

        this.isPlayModeActive = true;

        $("#startStopButton")[0].innerText = "Anhalten";

        // blocking click events
        $("#disablingActionsOverlay").show();

        // creates now as well joined trains
        this.drawElements();

        // hide sign buttons
        $(".sign-buttons").hide();

        // firstly trains from level 0 goes, later level 1, 2 ...
        for (let i = 1; i < this.levelsMap.size; i++) {
            this.levelsMap.get(i).forEach(train => {
                train.subTrains.forEach(subtrain => {
                    subtrain.move(train.position, duration - 1500, delay);
                });

            });
            delay += duration - 500;
            totalDuration += duration + delay;
        }

        setTimeout(function () {
            if (this.isPlayModeActive && (localTimeStamp == window.timestamp)) {
                let isCorrect = false;
                $("#disablingActionsOverlay").hide();
                // check solution correctness 
                if (eval(this.equation) == finalTrain.value) {
                    this.points = this.points + 10* this.level;
                    this.streak++;
                    this.badStreak=0;
                    if(this.streakthreshold[1]==this.streak){
                        if(this.level<this.equations.length-1){
                            this.level++;
                        }
                        this.streakthreshold[1]=this.streakthreshold[0]+this.streakthreshold[1];
                        this.streakthreshold[0]=this.streakthreshold[1]-this.streakthreshold[0];
                        this.streak=0;
                    }
                    console.log("Correct!");
                    isCorrect = true;
                } else {
                    this.streak=0;
                    this.badStreak++;

                    /*if(level>0){
                        this.level--;
                        let oldstreakTop=this.streakthreshold[1];
                        let oldstreakbtm=this.streakthreshold[0];
                        this.streakthreshold[1]=this.streakthreshold[0];
                        this.streakthreshold[0]=oldstreakBtm-(oldstreakTop-oldstreakbtm);
                    }*/

                    console.log("Incorrect!");
                    $("#startStopButton")[0].innerText = "Nochmal";

                    this.points-=5;
                }

                let points = this.points;
                finalTrain.move({ x: finalTrain.position.x + 250, y: finalTrain.position.y }, duration, 0);
                $('#points').text(points);
                $('#level').text(`Level: ${this.level}`);
                let progress=this.streak/(this.streakthreshold[1]/100);
                console.log('progress: ' + progress)
                $('.progressBar').width(`${progress}%`);
                let badprogress=this.badStreak/(this.streakthreshold[0]/100);

                $('.badProgressBar').width(`${badprogress}%`);
                this.showFeedback(finalTrain.value);
            }
        }.bind(this), delay);
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

/*
0
   1
3     2
   4
5

such ids are needed for the correct final equation
*/