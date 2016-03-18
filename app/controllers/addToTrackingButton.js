app.directive("otcDynamic", function($compile) {
     
    var template = "<button ng-click='doSomething()'>{{label}}</button>";
     
    return{
        link: function(scope, element){
            element.on("click", function() {
                scope.$apply(function() {
                    var content = $compile(template)(scope);
                    element.append(content);
               })
            });
        }
    }
});