

class Train {
    value; visible; id; eqString; position; level;
    constructor(id, value, position, level) {
        this.value = value;
        this.id = id;
        this.visible = true;
        this.eqString = value;
        this.position = position;
        this.level = level;
        this.group=null;
        this.rails=null;
        this.path;
        this.pathAnimation=null;
        this.cargoTrains=[];
        this.lok=null;
        this.moving=false;
        this.animatedTrains=[];
        this.finaltrain=false;
    }

    updateAnimatedTrains(){
        this.animatedTrains=[];

        this.animatedTrains.push(new AnimatedTrain(this.group));
        this.cargoTrains.forEach(cargo=>{
            this.animatedTrains.push(new AnimatedTrain(cargo));
        });
    }
      
    // TODO rotation of trains
    async move(target, duration, delay) {
        let result= await this.waitForSeconds(delay);
        this.group.show();

        this.group.first().first().attr({ x:  -50, y: -18});
        this.group.first().last().attr({ x:  -50 + 15, y: 0});

        //this.group.children()[this.group.children().length-1].attr({ x:  -50+15, y: 6});


        this.cargoTrains.forEach(element=>{
            element.show();
            //element.attr({ x:  0, y: 0});
        });
        console.log('level' + this.level);
        
        let offset=17;
        if(this.level>=1&&!this.finaltrain){
            offset+=15;
        }
        this.animatedTrains.forEach((train,id)=>{       
            let animator=train.setupPath(this.id);
            let totaltrains=this.animatedTrains.length;
            let start= (totaltrains-(id+1))*offset;
            let end=100-id*offset;
            train.startAnimation(start,end,animator);
        });
    }

    waitForSeconds(duration) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('resolved');
          }, duration);
        });
      }
      

}

