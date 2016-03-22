Template.statistics.helpers({
    "usedItems": function(){
        var filter = {};
        filter["usedAt"]= {$exists: true};
        return Stock.find(filter);
    },
    "expiredItems": function(){
        var filter = {};
        filter["expiredAt"] = {$exists: true};
        return Stock.find(filter);
    },
    "items": function(){
        var filter = {};
        filter["usedAt"]= {$exists: false};
        filter["expiredAt"] = {$exists: false};
        return Stock.find(filter,{sort:{pricePerUnit:1}});
    },
    "statCount": function(param){
        var result = {};
        var filter = {};
        var items = Stock.find(filter,{sort:{pricePerUnit:1}});
        items.forEach(function(item){
            item[param] ? null : item[param] = "Not Named";
            if(item.weight){
                result[item[param]] ? null : result[item[param]] = {spent:0};
                result[item[param]]['spent'] += Math.round((item.pricePerUnit * item.weight)*100)/100;
            }
            else{
                result[item[param]] ? null : result[item[param]] = {spent:0};
                result[item[param]]['spent'] += Math.round(item.pricePerUnit*100)/100;
            }

        });
        var tmp = _.map(result, function(val,key){return {name: key, value: val}});
        var final = _.sortBy(tmp, function(item){
            return -item.value.spent
        });
        return final;
    },
    "totalPrice": function(){
        var items = Stock.find();
        var sum = 0;
        items.forEach(function(item){
            if(item.weight){
                sum += item.pricePerUnit * item.weight;
            }
            else{
                sum += item.pricePerUnit;
            }
        });
        return sum;
    }
});

Template.statistics.events({

});