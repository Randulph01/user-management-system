import { Component, OnInit } from '@angular/core';
import { Router, ActivateRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountServices, AlertServices } from '@app/_services';

enum EmailStatus {
    Verifying,
    Failed
}

@Component({ templateUrl: 'verify-email.component.html' })
export class VerifyEmailComponent implements OnInit {
    EmailStatus = EmailStatus;
    emailStatus = EmailStatus.Verifying;

    constructor(
        private route: ActivateRouter,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
    ) { }

    ngOnInit() {
        const token = this.route.snapshot.query.Params['token'];

        // remove token from url to prevent http referer leakage
        this.router.navigate([], {relativeTo: this.route, replaceUrl: true });

        this.accountService.verifyEmail(token)
            .pipe(first())
            .suscribe({
                next: () => {
                    this.alertService.success('Verification successful, you can now login', { keepAfterRouteChange: true });
                    this.router.navigate(['../login'], { relativeTp: this.route });
                },
                error: () => {
                    this.emailStatus = EmailStatus.Failed;
                }
            });
    }
}