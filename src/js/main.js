var equation="1+3*2=7"
let numsRegex = /\d+/g
let opsRegex = /[^=\d]/g

function init(){
    $( "div.equation" ).html( equation)
    numbers= equation.match(numsRegex)
    solution=numbers.pop()
   
    var numberList = $("<ul></ul>"); 
    numbers.forEach(element => {
        numberList.append(`<li>${element}</li>`);
    });
    $("div.numberTrains").append(numberList);
    $("div.solutionDestination").html(solution);
    operations=equation.match(opsRegex)
    console.log(operations)
    var operationList = $("<ul></ul>"); 
    operations.forEach(element=>{
        operationList.append(`<li>${element}</li>`);

    });
    $("div.operationStations").append(operationList);
}
