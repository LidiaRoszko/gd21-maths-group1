class TrainStation {
    constructor(x, y, grid) {
        this.x = x;
        this.y = y;
        this.svgElement = null;
        this.grid = grid
    };


    draw(iteration) {
        if (iteration > 0) {
            this.x += 2 + iteration % 2;
            this.y += 1;
        }


        let posX = this.x;
        let posY = this.y;


        if (posX < 0) {
            return;
        }
        if (posY < 0) {
            return;
        }

        let station = this.grid.drawAtPos(this.grid.drawImage('trainStation'), { x: posX, y: posY });

        station.click(() => {

            if (posY % 2 == 0) {
                console.log('drawing odd station')
                this.grid.drawPath(posX - 1, posX, posY - 1, posY);
                this.grid.drawPath(posX - 1, posX, posY + 1, posY);
            } else {
                console.log('drawing even station')
                this.grid.drawPath(posX - 2, posX, posY - 1, posY);
                this.grid.drawPath(posX - 2, posX, posY + 1, posY);
            }
            const index = this.grid.stations.indexOf(this);
            if (index > -1) {
                this.grid.stations.splice(index, 1);
            }
            this.grid.stations.forEach((element, i) => {
                if (i >= index) {
                    element.y += -2;
                }
            });;
            this.grid.startRound();

        });
        this.svgElement = station;

    }
}