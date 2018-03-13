# basic-state-machine
[![NPM](https://nodei.co/npm/basic-state-machine.png?compact=true)](https://nodei.co/npm/basic-state-machine/)

a lightweight (< 500 bytes), basic finite-state-machine utility.
```js
import getStateMachine from 'basic-state-machine'

const lights = {
  red: {
    TIMER: ['green', onRedToGreen] // if no handler, simply 'green'
  },
  green: {
    TIMER: ['yellow', onGreenToYellow] // ibid, 'yellow'
  },
  yellow: {
    TIMER: ['red', onYellowToRed] // ibid, 'red'
  }
}

let state = getStateMachine(lights, 'red')

console.log(state()) // 'red'
issueCommand('TIMER')
console.log(state()) // 'green'
issueCommand('TIMER')
console.log(state()) // 'yellow'
issueCommand('TIMER')
console.log(state()) // 'red'

function issueCommand (command) {
  const [newState, handler] = state(command)
  state = newState
  handler && handler() // transition functions are optional
}
```
As highlighted by the above example, state machines from this module focus
exclusively on state transitions:
* changing states, and
* merely providing corresponding transition payloads, if any.
in this example the transition payloads are transition handlers.

this voluntarily minimal API contract enables versatility of implementations,
as demonstrated by the more involved example below.

# API
for a detailed specification of this API,
run the [unit tests](https://cdn.rawgit.com/ZenyWay/basic-state-machine/v1.0.0/spec/web/index.html)
in your browser.

```ts
export default function <P>(spec: AutomataSpec<P>, init: string): StateMachine<P>

export declare type AutomataSpec<P> =
  IndexedMap<IndexedMap<string | [string, void | P]>>

export interface StateMachine<P> {
    (): string
    (command: string): [StateMachine<P>, void | P]
}

export interface IndexedMap<T> {
    [key: string]: T
}
```

this module exposes a factory that takes a basic Finite-State-Machine specification
and an initial state string, and returns a state function,
essentially a getter function which:
* is stateless, immutable and strictly equivalent to its corresponding state string,
i.e. strict equality of state functions is equivalent to
strict equality of the corresponding state,
* when called without argument, returns the current state string,
* when called with a command string, returns an array with two entries:
  1. the new state function,
  resulting from the command applied to the previous state function.
  2. the transition payload specified for the previous state and the given command.
* if the command string is not recognized by the state function,
the array it returns includes itself and `undefined`, i.e. no state transition.

a Finite-State-Machine specification is an object with keys for each state.
values are themselves objects with keys for each command a given state accepts.
the values of the latter are the transition specifications.

transitions are specified either as the string specifying the next state,
or as an array with two entries:
* the first entry is the string specifying the next state.
* the second entry is the transition function that is returned by the state function.

# Example
see the full [example](./example/index.tsx) in this directory.
run the example in your browser locally with `npm run example`
or [online here](https://cdn.rawgit.com/ZenyWay/basic-state-machine/v1.0.0/example/index.html).

this example is refactored from that of [`with-event-handlers`](https://www.npmjs.com/package/with-event-handlers):
it demonstrates how to implement `component-from-stream` Components
using `with-event-handlers` and a `basic-state-machine`.
the state machine replaces the reducer logic of that example,
and is arguably overkill in this case, but serves the purpose of illustration.
state-machines are a useful tool to minimize reducer logic
and maintain self-documenting code when component behaviour becomes more complex.

thanks to its minimal contract, the state machine may readily be wrapped as a reducer
that maps previous props and an action to updated props:

`reducers.ts`
```ts
function withFsmReducer<P> (
  spec: AutomataSpec<Reducer<Action<any>,any>>,
  init: string
) {
  let state = getStateMachine(spec, init)

  return function (props: P, { type, payload }: Action<any>) {
    const [newState, reduce] = state(type)
    state = newState
    // reduce is void when the action type is unknown for the current state
    const update = reduce && reduce(props, payload)
    return update || props
  }
}
```

`copy-button/behaviour.ts`
```ts
import createPropsDispatcher, { ActionCreatorMap } from 'with-event-handlers'
import {
  Action, AutomataSpec, keep, Reducer, toggle, withDefaults, withFsmReducer
} from '../reducers'
import { omit, shallowEqual } from '../utils'
import compose from 'basic-compose'
import { into } from 'basic-cursors'
import { distinctUntilChanged, map, scan, tap } from 'rxjs/operators'
import copyToClipboard = require('clipboard-copy')

// ...

export const DEFAULT_PROPS: CopyButtonProps = {
  value: '',
  timeout: 500, // ms
  icons: {
    disabled: 'fa-check',
    enabled: 'fa-copy'
  }
}

const fsm = {
  enabled: {
    CLICK: [
      'disabled',
      compose(toggle('disabled'), keep(), enableAfterTimeout, doCopyToClipboard)
    ],
    PROPS: ['enabled', withDefaults(DEFAULT_PROPS)]
  },
  disabled: {
    ENABLE: ['enabled', compose(toggle('disabled'), keep())],
    PROPS: ['disabled', compose(withDefaults(DEFAULT_PROPS), keep('disabled'))]
  }
} as AutomataSpec<Reducer<any,any>>

const actions: ActionCreatorMap<Action<any>> = {
  onClick(payload: any) {
    return { type: 'CLICK', payload }
  },
  enable() {
    return { type: 'ENABLE' }
  },
  onProps(payload: CopyButtonProps) {
    return { type: 'PROPS', payload }
  }
}

const dispatcher = createPropsDispatcher(actions)

const operator = compose(
  tap(log('copy-button:view-props:')),
  distinctUntilChanged(shallowEqual),
  map(omit('value', 'icons', 'timeout')), // clean-up
  map(into('icon')(iconFromDisabled)),
  scan(withFsmReducer(fsm, 'enabled'), {})
) as RxOperator<Action<any>,ButtonViewProps>

const behaviour = {
  operator, dispatcher
} as BehaviourSpec<CopyButtonProps,Action<any>,ButtonViewProps>

export default behaviour

function enableAfterTimeout(previous) {
  const { timeout, enable } = previous
  setTimeout(enable, timeout)
}

function doCopyToClipboard({ value }, event) {
  event.preventDefault()
  return copyToClipboard(value) //true on success
}

function iconFromDisabled ({ disabled, icons }: any) {
  return disabled ? icons.disabled : icons.enabled
}
```

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.

# License
Copyright 2018 Stéphane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.

