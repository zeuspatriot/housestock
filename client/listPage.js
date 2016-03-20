Template.listPage.helpers({
    "products": function(){
        return Products.find({},{sort: {like: 1}});
    },
    "stockItems": function(){
        var listItems = List.find({});
        var result = {};
        var generalWeight = {};
        listItems.forEach(function(elem){
            var items = Stock.find({name:elem.name,usedAt:{$exists: false}, expiredAt: {$exists: false} })
            items.forEach(function(elem){
                result[elem.name] = elem;
                generalWeight[elem.name] ? null : generalWeight[elem.name] = 0;
                if(elem.hasWeight) generalWeight[elem.name] += elem.weight;
                var count = Stock.find({name:elem.name, usedAt:{$exists: false}, expiredAt: {$exists: false} }).count();
                result[elem.name]["amount"] = count;
                if(elem.hasWeight){
                    result[elem.name]["weight"] = generalWeight[elem.name];
                    result[elem.name]["price"] = elem.pricePerUnit * elem.weight;
                }
            });
        });

        //var items = Stock.find({usedAt:{$exists: false}, expiredAt: {$exists: false}});
        return _.map(result, function(val,key){return {name: key, value: val}});
    },
    "total": function(){
        var listItems = List.find({});
        var total = 0;
        listItems.forEach(function(item){
            if(item.hasWeight){
                total += item.pricePerUnit * item.weight;
            }
            else{
                total += item.pricePerUnit;
            }
        });
        return total.toFixed(2);
    }
});
Template.listPage.events({
    "click #addToStock": function(){
        var listId = jQuery("#listId").text();
        var items = List.findOne(listId).items;
        for (item in items){
            var item = items[item];

        }
    },
    "click #addProductCancel": function(){
        jQuery(".popup").css("display","none");
        jQuery(".greyout").css("display","none");
    }
});
Template.addListItems.events({
    "change #productToAdd": function(event){
        var product = Products.findOne(event.target.value);
        return Session.set("currProduct", product);
    },
    "submit .addToList": function(event){
        event.preventDefault();
        var product = {
            likedBrands: [],
            dislikedBrands: []
        };
        jQuery(event.target).find('input').each(function(){
            var field = jQuery(this);
            var name = field.attr("name");
            var value = field.val();
            if (field.attr("type") == "number"){
                value = value * 1;
            }
            product[name] = typeof(value) == 'string' ? value.toLowerCase() : value;
        });
        if(jQuery("th input#weight")[0].checked){
            product["weight"] = product.amount;
            product["amount"] = 1;
        }
        //console.log(event.target.name.value);
        var disliked = Products.find({name: event.target.name.value.toLowerCase()});
        disliked.forEach(function(item){
            item.like ?
                product.likedBrands.push(item.brand) :
                product.dislikedBrands.push(item.brand);
        });

        List.insert(product, function(error, result){});

        jQuery(event.target).find('input').val("");
    },
    "click #addProduct": function(){
        jQuery(".popup#addProduct").css("display","block");
        jQuery(".greyout").css("display","block");
    }
});
Template.addListItems.helpers({
    "products": function(){
        return Products.find({},{sort:{ like: -1, name: 1}})
    },
    "currProduct": function(){
        var currentProduct = Session.get("currProduct")
            ? Session.get("currProduct")
            : Products.findOne(jQuery("#productToAdd").val());
        return currentProduct;
    }
});
Template.listItems.helpers({
    "items": function(){
        var items = List.find({});
        //items.forEach(function(item){
        //    item['likedBrands'] = [];
        //    item['dislikedBrands'] = [];
        //    var products = Products.find({name: item.name});
        //        products.forEach(function(prod){
        //            prod.like ?
        //                List.update(item._id,{$set:{likedBrands: prod.brand}})
        //                :
        //                List.update(item._id,{$set:{dislikedBrands: prod.brand}})
        //        })
        //});
        console.log(items.fetch());
        return items;
    }
});
Template.listItems.events({
    "click .remove": function(){
        List.remove(this._id);
    },
    "click .transferToStock": function(event){
        jQuery(".toStock#"+this._id).show();
        jQuery(".greyout").show();
    },
    "submit .transferToStockSubmit": function(event){
        event.preventDefault();
        var product = this.value;
        var id = this.value._id;
        jQuery(event.target).find('input').each(function(){
            var field = jQuery(this);
            var name = field.attr("name");
            var value = field.val();
            if (field.attr("type") == "checkbox"){
                value = field[0].checked;
            }
            if (field.attr("type") == "number"){
                value = value * 1;
            }
            product[name] = value;
        });
        if(product.hasWeight){
            product["pricePerUnit"] = Math.round((product["pricePerUnit"] * product["weight"])*100) / 100;
        }
        product["boughtAt"] = new Date().yyyymmdd();
        Stock.insert(product, function(err, res){
            List.remove(id);
            jQuery(".popup").hide();
            jQuery(".greyout").hide();
        });
    },
    "click #toStockCancel":function(){
        jQuery(".popup").hide();
        jQuery(".greyout").hide();
    }
});