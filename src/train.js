class Train {
    value; visible; id; position; level;
    constructor(id, value, position, level) {
        this.value = value;
        this.id = id;
        this.visible = true;
        this.position = position;
        this.level = level;
        this.finalTrain = false;
        this.connectedToStation = false;
    }

    async move(target, duration, delay) {
        let localTimeStamp = window.timestamp;
        let trainHTML = $('.train-' + this.id)[0];
        var trainSVG = SVG.find('.train-' + this.id);

        var path = SVG.find('.path-' + this.id)[0];
        var length = path.length();

        var angle = 0;
        var pathPoint = path.pointAt(0 * length);
        var offsetY = pathPoint.y - 55;

        trainHTML.setAttribute('transform-box', "transformAttr");
        trainHTML.setAttribute('transform-origin', pathPoint.x + "px " + pathPoint.y + "px");

        // if the rails go down 
        if (target.y - this.position.y > 0) {
            angle = 25;
            offsetY = offsetY + 7;
        } else if (target.y - this.position.y < 0) {
            angle = 335;
        } else {
            angle = 0;
            offsetY = this.position.y - 10;
        }

        var pace = 3;

        // quicker for firefox
        if (navigator.userAgent.indexOf("Firefox") != -1) {
            pace = 7.5;
        }

        if (await this.waitForSeconds(delay, localTimeStamp)) {
            for (var i = 0.0; i < duration; i = i + pace) { //adjusting pace
                if (i / duration < 0.55) { //not going to far into the station
                    if (await this.waitForSeconds(1, localTimeStamp)) {
                        trainSVG.show();
                        var x = path.pointAt(i / duration * length).x;
                        var transformAttr = ' rotate(' + angle + '), translate(' + (x) + ', ' + offsetY + ')';
                        trainHTML.setAttribute('transform', transformAttr);
                    } else {
                        trainSVG.hide();
                        return;
                    }
                }
            }
        }
        trainSVG.hide();
    }

    waitForSeconds(duration, localTimeStamp) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve((window.timestamp == localTimeStamp)); //action can be performed only if play mode active
            }, duration);
        });
    }
}

