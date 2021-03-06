﻿angular
    .module('bit.organization')

    .controller('organizationVaultAddLoginController', function ($scope, apiService, $uibModalInstance, cryptoService,
        cipherService, passwordService, $analytics, authService, orgId, $uibModal) {
        $analytics.eventTrack('organizationVaultAddLoginController', { category: 'Modal' });
        $scope.login = {};
        $scope.hideFolders = $scope.hideFavorite = $scope.fromOrg = true;

        authService.getUserProfile().then(function (userProfile) {
            var orgProfile = userProfile.organizations[orgId];
            $scope.useTotp = orgProfile.useTotp;
        });

        $scope.savePromise = null;
        $scope.save = function (model) {
            model.organizationId = orgId;
            var login = cipherService.encryptLogin(model);
            $scope.savePromise = apiService.ciphers.postAdmin(login, function (loginResponse) {
                $analytics.eventTrack('Created Organization Login');
                var decLogin = cipherService.decryptLogin(loginResponse);
                $uibModalInstance.close(decLogin);
            }).$promise;
        };

        $scope.generatePassword = function () {
            if (!$scope.login.password || confirm('Are you sure you want to overwrite the current password?')) {
                $analytics.eventTrack('Generated Password From Add');
                $scope.login.password = passwordService.generatePassword({ length: 12, special: true });
            }
        };

        $scope.addField = function () {
            if (!$scope.login.fields) {
                $scope.login.fields = [];
            }

            $scope.login.fields.push({
                type: '0',
                name: null,
                value: null
            });
        }

        $scope.removeField = function (field) {
            var index = $scope.login.fields.indexOf(field);
            if (index > -1) {
                $scope.login.fields.splice(index, 1);
            }
        }

        $scope.clipboardSuccess = function (e) {
            e.clearSelection();
            selectPassword(e);
        };

        $scope.clipboardError = function (e, password) {
            if (password) {
                selectPassword(e);
            }
            alert('Your web browser does not support easy clipboard copying. Copy it manually instead.');
        };

        function selectPassword(e) {
            var target = $(e.trigger).parent().prev();
            if (target.attr('type') === 'text') {
                target.select();
            }
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };

        $scope.showUpgrade = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/views/paidOrgRequired.html',
                controller: 'paidOrgRequiredController',
                resolve: {
                    orgId: function () { return orgId; }
                }
            });
        };
    });
