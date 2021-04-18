grid = new Grid(16, 16, 72);
grid.drawGrid();
grid.trains.forEach((train, index) => {
    grid.stations.push(new TrainStation(2, (index + 1) * 2, grid));
});


grid.startRound();