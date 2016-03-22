UI.registerHelper('priceForWeightProducts', function(pricePerUnit, weight){
    if(weight){
        return Math.round((pricePerUnit * weight)*100)/100;
    }
    else{
        return pricePerUnit;
    }
});

UI.registerHelper("mathRoundPrice", function(price){
    return Math.round(price*100)/100;
});