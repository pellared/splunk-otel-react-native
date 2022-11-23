import { RandomIdGenerator } from '@opentelemetry/sdk-trace-base';
import { AppState } from 'react-native';
import { trace } from '@opentelemetry/api';

const idGenerator = new RandomIdGenerator();

interface Session {
  startTime: number;
  id: string;
}

let session: Session = {
  startTime: Date.now(),
  id: idGenerator.generateTraceId(),
};

const tracer = trace.getTracer('session');
//FIXME add conf
const MAX_SESSION_AGE = 4 * 60 * 60 * 1000;
const SESSION_TIMEOUT = 15 * 60 * 1000;

let lastActivityTime = Date.now();
const State = {
  FOREGROUND: 'active',
  BACKGROUND: 'background',
  TRANSITIONING_TO_FOREGROUND: 'transitioning',
};
let currentState: String = AppState.currentState;

AppState.addEventListener('change', (nextAppState) => {
  console.log('Session:AppStateChange: ', currentState, nextAppState);
  if (nextAppState === State.FOREGROUND && currentState === State.BACKGROUND) {
    console.log('Session:AppStateChange:TRANSITIONING_TO_FOREGROUND');
    currentState = State.TRANSITIONING_TO_FOREGROUND;
    return;
  }
  currentState = nextAppState;
});

export function getSessionId() {
  if (hasExpired() || hasTimedOut()) {
    newSessionId();
  }
  bump();
  return session.id;
}

function bump() {
  lastActivityTime = Date.now();
  console.log('Session:bump:', new Date(lastActivityTime));
  // when the app spent >15 minutes without any activity (spans) in the background,
  // after moving to the foreground the first span should trigger the sessionId timeout.
  if (currentState === State.TRANSITIONING_TO_FOREGROUND) {
    currentState = State.FOREGROUND;
  }
}

function hasTimedOut() {
  // don't apply sessionId timeout to apps in the foreground
  if (currentState === State.FOREGROUND) {
    console.log('Session:hasTimedOut: State.FOREGROUND');
    return false;
  }
  const elapsedTime = Date.now() - lastActivityTime;
  console.log(
    'Session:hasTimedOut',
    elapsedTime,
    SESSION_TIMEOUT - elapsedTime
  );
  return elapsedTime >= SESSION_TIMEOUT;
}

function hasExpired() {
  const timeElapsed = Date.now() - session.startTime;
  console.log('Session:hasExpired', timeElapsed, MAX_SESSION_AGE - timeElapsed);
  return Date.now() - session.startTime >= MAX_SESSION_AGE;
}

function newSessionId() {
  const previousId = session.id;
  session.startTime = Date.now();
  session.id = idGenerator.generateTraceId();
  console.log('Session:newSessionId:', previousId, session.id);
  const span = tracer.startSpan('sessionId.change', {
    attributes: {
      'splunk.rum.previous_session_id': previousId,
    },
  });
  span.end();
}

export function _generatenewSessionId() {
  newSessionId();
  console.log('CLIENT:session:generateNewId: ', session.id);
}
