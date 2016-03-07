Template.main.helpers({
    "products": function(){
        return Products.find({},{sort:{like:-1, name: 1}});
    }
});
Template.main.events({

});
Template.addProduct.events({
    "submit .newProduct": function(event){
        event.preventDefault();
        var product = {};
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
        Products.insert(product, function(error, results){
            jQuery('.newProduct input').val("");
        });
    }
});

Template.product.events({
    "click .remove": function(){
        Products.remove(this._id);
    },
    "click .edit": function(){
        Products.update(this._id,{$set:{edit: !this.edit}});
    },
    "submit .editProduct": function(event){
        event.preventDefault();
        var product = {};
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
        Products.update(this._id, product);
    }
});