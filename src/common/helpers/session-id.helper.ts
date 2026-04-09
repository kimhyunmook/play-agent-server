import { randomUUID } from 'crypto';

const DEFAULT_MAX_ATTEMPTS = 32;

type SessionIdTakenPredicate = (id: string) => Promise<boolean>;

/**
 * 이미 사용 중인 sessionId인지 검사하는 콜백과 충돌하지 않는 UUID를 만듭니다.
 * randomUUID() 단독 충돌은 무시할 수준이지만, DB/운영 일관성을 위해 방어적으로 사용합니다.
 */
export async function allocateUniqueSessionId(isTaken: SessionIdTakenPredicate): Promise<string> {
    for (let attempt = 0; attempt < DEFAULT_MAX_ATTEMPTS; attempt += 1) {
        const id = randomUUID();
        if (!(await isTaken(id))) return id;
    }
    throw new Error(`세션 ID를 ${DEFAULT_MAX_ATTEMPTS}회 내에 고유하게 생성하지 못했습니다.`);
}
