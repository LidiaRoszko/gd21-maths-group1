class AnimatedTrain{
    
    constructor(element,train){
        this.element=element;
        this.pathAnimator=null;
        this.train=train;
    }

    setupPath(trainId){
        var path = $('#centerline'+trainId).attr('d');
        return new PathAnimator( path, {
            duration : 3, // seconds that will take going through the whole path
            step     : step,
            easing   : function(t){ return t},
            onDone   :  this.finish,
            element : this.element,
            train:this.train
        })

    }
    startAnimation(start,end, animator){

        if(animator){
            //console.log('found pathAnimator')
            animator.start( start, end );

        }
    }
    finish(){
        // do something when animation is done
        console.log('finished');
        this.element.css('visibility', 'hidden'); 
        this.train.moving=false;
        this.train.stopsmoke=true;
        this.train.visible=false;
        //console.log(this.train)
    }
}

function step( point, angle, element, train ){
    train.moving=true;
    train.startSteam(train);

    if(element.first()){
        element.center(point.x,point.y);
        element.first().rotate(angle -  element.first().transform().rotate);
    }else{
        element.rotate(- element.transform().rotate);
        element.center(point.x,point.y);
        element.rotate(angle);
    }

}
