import { PubSubService } from '../_shared/pubSubServiceInterface';

interface VisibilityPreferences {
  isShownPatientInfo: boolean;
  isShouldAnonymizePatientInfo: boolean;
}

interface VisbilityPreferencesServiceImplementation {
  getState: () => VisibilityPreferences;
  setVisibilityPreferences: (visibilityPreferences: Partial<VisibilityPreferences>) => void;
}

class VisbilityPreferencesService extends PubSubService {
  public static readonly EVENTS = {
    VISIBILITY_PREFERENCES_CHANGED: 'event::visibilityPreferencesChanged',
  };

  public static REGISTRATION = {
    name: 'visibilityPreferencesService',
    altName: 'VisbilityPreferencesService',
    create: ({ configuration = {} }) => {
      return new VisbilityPreferencesService();
    },
  };

  visibilityPreferences: VisibilityPreferences;

  serviceImplementation: VisbilityPreferencesServiceImplementation;

  constructor() {
    super(VisbilityPreferencesService.EVENTS);

    this.visibilityPreferences = {
      isShownPatientInfo: true,
      isShouldAnonymizePatientInfo: false,
    };

    this.serviceImplementation = {
      getState: () => this.visibilityPreferences,
      setVisibilityPreferences: () => {},
    };
  }

  public setServiceImplementation(
    serviceImplementation: VisbilityPreferencesServiceImplementation
  ) {
    this.serviceImplementation = serviceImplementation;
  }

  public getState() {
    return this.serviceImplementation.getState();
  }

  public setVisibilityPreferences(visibilityPreferences: Partial<VisibilityPreferences>) {
    this.serviceImplementation.setVisibilityPreferences(visibilityPreferences);
    setTimeout(() => this._broadcastEvent(this.EVENTS.VISIBILITY_PREFERENCES_CHANGED, null), 0);
  }
}

export default VisbilityPreferencesService;
