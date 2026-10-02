import {CONNECTED_PLATFORM_VERSION,DOMAIN_OWNERSHIP,JOURNEY_CONTRACT,evaluateJourneyConsistency} from '../domain/journey.js';
import {createProviderRegistry} from '../infrastructure/providers.js';

export function createConnectedMatchdayPlatform(options={}){
  const providers=createProviderRegistry(options);
  return Object.freeze({
    version:CONNECTED_PLATFORM_VERSION,
    architecture:'connected-capable',
    journey:JOURNEY_CONTRACT,
    domains:DOMAIN_OWNERSHIP,
    providers,
    connectionMode:providers.mode,
    externalProductionFeatures:providers.externalProductionFeatures,
    connectedProviders:providers.connectedNames,
    mockProviders:providers.mockNames,
    evaluateJourney:evaluateJourneyConsistency,
    executeProvider:(name,method,input)=>providers.execute(name,method,input)
  });
}

export const connectedMatchdayPlatform=createConnectedMatchdayPlatform();
