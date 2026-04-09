import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AppConfigService } from 'src/core/config/app-config.service';

export interface GoogleProfile {
    id: string;
    email: string;
    name?: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly env: AppConfigService) {
        const clientID = env.googleClientId ?? '';
        const clientSecret = env.googleClientSecret ?? '';
        const callbackURL = `${env.domainUrl}/auth/oauth/google/callback`;

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['email', 'profile'],
        });
    }

    validate(
        _accessToken: string,
        _refreshToken: string,
        profile: { id: string; displayName?: string; emails?: { value: string }[] },
    ): GoogleProfile {
        const email = profile.emails?.[0]?.value ?? '';
        return {
            id: profile.id,
            email,
            name: profile.displayName ?? null,
        };
    }
}
