class JoinedTrain extends Train {
    sign; subTrains;
    constructor(id, position, level) {
        super(id, undefined, position, level);
        this.visible = false;
        this.sign = "";
        this.subTrains = [];
        this.connected = false;
        this.bigStation = false;
    }

    updateSign(sign) {
        this.sign = sign;
        this.calculate();
    }

    connectWith(train1, train2) {
        this.subTrains = [];
        this.subTrains.push(train1);
        this.subTrains.push(train2);
        this.visible = true;
        this.calculate();
    }

    disconnectFrom(trainId) {
        let subtrainsIds = this.subTrains.map(x => x.id);
        if (subtrainsIds.includes(trainId)) {
            this.subTrains = this.subTrains.filter(x => x.id != trainId);
            this.sign = "";
            this.calculate();
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
            this.value = eval(train1.value + this.sign + train2.value);
        } else if (this.subTrains.length == 1) {
            this.value = this.subTrains[0].value;
        }
        this.value = Math.trunc(this.value);
    }
}