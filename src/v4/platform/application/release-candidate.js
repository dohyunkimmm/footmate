import {ANALYTICS_CONTRACT,IA_CONTRACT,PERFORMANCE_BUDGET,PROVIDER_CONTRACTS,RELEASE_CANDIDATE_VERSION,assertProviderContract,rehearseSessionMigration} from '../domain/release-candidate.js';
import {createProviderMocks} from '../infrastructure/provider-mocks.js';

export function createReleaseCandidateGate({providers=createProviderMocks()}={}){
  const providerStatus=Object.freeze(Object.fromEntries(Object.keys(PROVIDER_CONTRACTS).map(name=>[name,assertProviderContract(name,providers[name])])));
  const readyForV5=Object.values(providerStatus).every(result=>result.valid);
  return Object.freeze({
    version:RELEASE_CANDIDATE_VERSION,
    readyForV5,
    iaRoutes:Object.freeze(IA_CONTRACT.map(item=>item.route)),
    providerStatus,
    providerMode:'mock-only',
    externalProviders:false,
    externalAnalytics:ANALYTICS_CONTRACT.externalAnalytics,
    performanceBudget:PERFORMANCE_BUDGET,
    rehearseMigration:candidate=>rehearseSessionMigration(candidate)
  });
}

export const releaseCandidateGate=createReleaseCandidateGate();
