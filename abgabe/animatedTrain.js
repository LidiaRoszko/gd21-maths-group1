class AnimatedTrain{
    constructor(element){
        this.element=element;
        this.pathAnimator=null;
    }

    setupPath(trainId){
        var path = $('#centerline'+trainId).attr('d');
        return new PathAnimator( path, {
            duration : 3, // seconds that will take going through the whole path
            step     : step,
            easing   : function(t){ return t},
            onDone   :  this.finish,
            element : this.element
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
    }
}

function step( point, angle, element ){
    
    if(element.first()){
        element.center(point.x,point.y);
        element.first().rotate(angle -  element.first().transform().rotate);
    }else{
        element.rotate(- element.transform().rotate);
        element.center(point.x,point.y);
        element.rotate(angle);
    }

}
