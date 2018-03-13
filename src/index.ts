/**
 * @license
 * Copyright 2018-present, Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http: *www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
export type AutomataSpec<P> = IndexedMap<IndexedMap<string|[string, void|P]>>

export interface StateMachine<P> {
  (): string
  (command: string): [StateMachine<P>, void|P]
}

export interface IndexedMap<T> {
  [key: string]: T
}

interface Automata<P> {
  machine: StateMachine<P>,
  commands: IndexedMap<[StateMachine<P>,void|P]>
}

export default function <P>(spec: AutomataSpec<P>, init: string): StateMachine<P> {
  return compile(spec, init)[init].machine
}

function compile <P>(
  spec: AutomataSpec<P>,
  state: string,
  automata = {} as IndexedMap<Automata<P>>
): IndexedMap<Automata<P>> {
  if (automata[state]) { return automata }

  const slice = automata[state] = { machine } as Automata<P>
  slice.commands = Object.keys(spec[state]).reduce(
    addCommands,
    {} as IndexedMap<[StateMachine<P>,void|P]>
  )

  return automata

  function machine (): string
  function machine (command: string): [StateMachine<P>, P|void]
  function machine (command?: string): string|[StateMachine<P>, P|void] {
    return !command ? state : slice.commands[command] || [ machine, void 0 ]
  }

  function addCommands (
    commands: IndexedMap<[StateMachine<P>,void|P]>,
    command: string
  ): IndexedMap<[StateMachine<P>,void|P]> {
    const config = spec[state][command]
    const [ nextState, payload ] = Array.isArray(config)
      ? config
      : [ config, void 0 ]
    const { machine } = compile(spec, nextState, automata)[nextState]
    commands[command] = [ machine, payload ]
    return commands
  }
}

