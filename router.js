Router.route('/',{
    template: 'main'
});
Router.route("/list/", {
    name: 'listPage',
    template: 'listPage'
});

Router.route("/stock/", {
    template: "stock",
    name: "stock"
});