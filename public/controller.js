(function() {
    const app = angular.module('app', ['ngRoute', 'angular-jwt']);

    //restriction

    app.run(function($http, $rootScope, $location, $window) {
        $http.defaults.headers.common['Authorization'] = 'Bearer' + $window.localStorage.token;

        $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
            if (nextRoute.access.restricted === true && !$window.localStorage.token) {
                event.preventDefault();
                $location.path('/login');
            }
            if ($window.localStorage.token && nextRoute.access.restrictes === true) {
                $http.post('/api/verify', { token: $window.localStorage.token })
                    .then(function(response) {
                        console.log('your token is valid')
                    }, function(err) {
                        delete $window.localStorage.token;
                        $location.path('/login');
                    })
            }
        });
    })

    app.config(function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider.when('/', {
            templateUrl: './templates/home.html',
            controller: 'HomeController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when("/login", {
            templateUrl: "./templates/login.html",
            controller: "LoginController",
            controllerAs: "vm",
            access: {
                restricted: false
            }
        });

        $routeProvider.when("/register", {
            templateUrl: "./templates/register.html",
            controller: "RegisterController",
            controllerAs: "vm",
            access: {
                restricted: false
            }
        });

        $routeProvider.when("/profile", {
            templateUrl: "./templates/profile.html",
            controller: "ProfileController",
            controllerAs: "vm",
            access: {
                restricted: true
            }
        });

        $routeProvider.when('/polls', {
            templateUrl: './templates/polls.html',
            controller: 'PollsController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

    });

    app.controller("HomeController", HomeController);

    function HomeController($location, $window) {
        var vm = this;
        vm.title = "HomeController";

    };

    app.controller("LoginController", LoginController);

    function LoginController($location, $window, $http) {
        var vm = this;
        vm.title = "LoginController";
        vm.error = "",
            vm.login = function() {
                if (vm.user) {
                    $http.post('/api/login', vm.user)
                        .then(function(response) {
                            $window.localStorage.token = response.data;
                            $location.path('/profile')
                        }, function(err) {
                            vm.error = err;
                        })
                } else {
                    console.log('No credentials supplied')
                }
            }
    };

    app.controller("RegisterController", RegisterController);

    function RegisterController($location, $window, $http) {
        var vm = this;
        vm.title = "RegisterController";

        vm.register = function() {
            if (!vm.user) {
                console.log('invalid credentials');

            }
            $http.post('/api/register', vm.user)
                .then(function(response) {
                    $window.localStorage.token = response.data;
                    $location.path('/profile');
                    console.log(response);
                }, function(err) {
                    console.log(err);
                })
        }

    };

    app.controller("ProfileController", ProfileController);

    function ProfileController($location, $window, jwtHelper) {
        var vm = this;
        vm.title = "ProfileController";
        vm.user = null;
        var token = $window.localStorage.token;
        var payload = jwtHelper.decodeToken(token).data;
        if (payload) {
            vm.user = payload;
        }

        vm.logout = function() {
            delete $window.localStorage.token;
            vm.user = null;
            $location.path('/login');
        }

    };

    app.controller('PollsController', PollsController);

    function PollsController($location, $window, $http) {
        var vm = this;
        vm.title = 'pollscontroller';
        vm.poll = {
            options: [],
            name: ''
        }

        vm.poll.options = [{
            name: '',
            votes: 0
        }]

        vm.addOption = function() {
            vm.poll.options.push({
                name: '',
                votes: 0
            })
        }

        vm.addPoll = function() {
            if (!vm.poll) {
                console.log('invalid data supplied');
                return;
            }
            $http.post('/api/polls', vm.poll)
                .then(function(response) {
                    console.log(response)
                }, function(err) {
                    console.log(err)
                });
        }
    };



}())