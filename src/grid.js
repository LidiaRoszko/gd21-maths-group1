class Grid {

    constructor(height, width, tileSize) {
        this.height = height;
        this.width = width;
        this.tileSize = tileSize;
        this.draw = SVG().addTo('.gameContainer').size('100%', '100%');
        this.stations = [];
        this.trains = [1, 2, 3, 4, 5];
        this.tracks = [];
        this.iteration = 0;
    }
    startRound() {
        this.stations.forEach(element => {
            element.draw(this.iteration);
        });
        this.iteration++;

    }
    drawGrid() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.drawAtPos(this.drawImage('green'), { x, y });
            }
        }
    }
    drawImage(image) {
        return this.draw.image(`../tracks/${image}.png`);
    }
    drawAtPos(SVGElement, pointer) {
        let position = this.getGameBoardPos(pointer.x, pointer.y);
        let element = SVGElement.move(position.x, position.y);
        return element;
    }
    getGameBoardPos(x, y) {
        if (y % 2) {
            // oddRow
            return { x: x * this.tileSize - this.tileSize / 2, y: y * this.tileSize * 2 / 3 };

        } else {
            return { x: x * this.tileSize, y: y * this.tileSize * 2 / 3 };

        }
    }
    drawPath(fromX, toX, fromY, toY) {
        if (toX < fromX) {
            return;
        }
        let stepX = 0;
        if (toX != fromX) {
            stepX = toX - fromX
            stepX = stepX / Math.abs(stepX);
        }
        let stepY = 0;
        if (toY != fromY) {
            stepY = toY - fromY
            stepY = stepY / Math.abs(stepY);
        }

        let pointer = {
            x: fromX,
            y: fromY,
            wentDown: false,
            wentUp: false

        }
        while (pointer.x != toX || pointer.y != toY) {
            if (pointer.x < toX) {
                console.log('goStraight');

                pointer = this.goStraight(pointer)
            }
            if (pointer.y < toY) {
                console.log('goDown');

                pointer = this.goDown(pointer);

            }
            if (pointer.y > toY) {
                console.log('goUp');

                pointer = this.goUp(pointer);

            }
        }
    }
    goStraight(pointer) {
        let track;
        if (pointer.wentDown) {
            track = this.drawAtPos(this.drawImage('downStraight'), pointer);

        } else {
            track = this.drawAtPos(this.drawImage('straight'), pointer);
        }
        pointer.wentDown = false;

        pointer.x++;
        this.tracks.push(track);
        return pointer;
    }


    goDown(pointer) {
        let track;

        if (pointer.wentDown) {
            track = this.drawAtPos(this.drawImage('down'), pointer);

        } else {
            track = this.drawAtPos(this.drawImage('straightDown'), pointer);

        }
        pointer.wentDown = true;
        pointer.y++;
        if (pointer.y % 2 == 1) {
            pointer.x++;
        }
        this.tracks.push(track);

        return pointer;
    }

    goUp(pointer) {
        let track;
        if (pointer.wentUp) {
            track = this.drawAtPos(this.drawImage('up'), pointer);

        } else {
            track = this.drawAtPos(this.drawImage('straightUp'), pointer);

        }
        pointer.wentUp = true;
        pointer.y--;
        if (pointer.y % 2 == 1) {
            pointer.x++;
        }
        this.tracks.push(track);

        return pointer;
    }



}