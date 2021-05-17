

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
        this.stopsmoke=false;
    }
    clear(){
        this.group.remove();
    }
    updateAnimatedTrains(){
        this.animatedTrains=[];

        this.animatedTrains.push(new AnimatedTrain(this.group,this));
        this.cargoTrains.forEach(cargo=>{
            this.animatedTrains.push(new AnimatedTrain(cargo,this));
        });
    }
      
    // TODO rotation of trains
    async move(target, duration, delay) {

        let result= await this.waitForSeconds(delay);
        this.moving=true;
        this.visible=true;
        let carts=this.group.children();
        this.group.show();
        this.group.first().children().forEach((child,index)=>{
            if(index==0){
                child.attr({ x:  -50, y: -18});

            }else{
                child.attr({ x:  -50 + 15, y: 0});

            }
        })


        //this.group.children()[this.group.children().length-1].attr({ x:  -50+15, y: 6});


        this.cargoTrains.forEach(element=>{
            element.show();
            //element.attr({ x:  0, y: 0});
        });
        //console.log('level' + this.level);
        let offset=17;

    
        if(!this.finaltrain){
            offset+=15;
        }
        this.animatedTrains.forEach((train,id)=>{       
            let animator=train.setupPath(this.id);
            let totaltrains=this.animatedTrains.length;
            //console.log('number of trains' + totaltrains);
            let start= (totaltrains-(id+1))*offset;
            let end=100-id*offset;
            //console.log(start,end);
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
      
    startSteam(train){
        let counter=0;
        let transform= train.group.transform();
        let position={x:train.group.attr('x'),y:train.group.attr('y')};
        let produceSteam = function (train){
            console.log(train.stopsmoke);
            if(train.visible==false||train.stopsmoke==true){
                clearInterval(this);
                return;
            }
            
            //console.log(counter);
            if((counter%5)+1==1){
                position={x:train.group.attr('x'),y:train.group.attr('y')};
                transform= train.group.transform();
            }
            let addSmoke= function (number,position){
                let smokeOffset={
                    x:69,
                    y:11
                }
        
                let canvas=SVG.find('#canvas>svg')
                let smoke;
                if(train.moving){
                    smoke=canvas.image(`./assets/smoke${number%5+1}.png`).x(position.x).y(position.y).transform(transform);

                }else{
                    smoke=canvas.image(`./assets/smoke${number%5+1}.png`).x(position.x+smokeOffset.x).y(position.y+smokeOffset.y).transform(transform);

                }
                return smoke;
           }
            let smoke = addSmoke(counter,position);
            setTimeout(function () {
               //console.log(smoke);
                smoke.remove(); 
            },200);
            counter++;
            // Your code here
           }
          
        var intervalID = window.setInterval(function(){produceSteam(train)}, 200);


    }

}

