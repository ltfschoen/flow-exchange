import { of, ObservableInput, from, combineLatest } from 'rxjs';
import { map, takeUntil, catchError, mergeMap, filter } from 'rxjs/operators';
import { mapObjIndexed, equals } from 'ramda';
import { ofType, Epic, StateObservable } from 'redux-observable';

import ReducerBuilder from './reducerBuilder';

export function createReducer<T, I = string, P = void, E = any>(
  apiAction: ApiActionTypesRecord<Partial<StateWithId<T, I, P, E>>>,
) {
  return new ReducerBuilder<MultiState<T, I, P, E>>({ states: {} })
    .handle(apiAction.requested, (state, { payload }) => {
      const params = payload?.params;
      const id = payload?.id;
      const idStr = id == null ? '' : String(id);
      const oldState = state.states[idStr] || {};
      return {
        states: {
          [idStr]: {
            id,
            loading: true,
            params,
            value: equals(oldState.params, params) ? oldState.value : undefined,
          },
        },
        lastId: id,
      };
    })
    .handle(apiAction.completed, (_state, { payload }) => {
      const id = payload?.id;
      const idStr = id == null ? '' : String(id);
      return {
        states: {
          [idStr]: {
            loading: false,
            value: payload?.value,
            error: undefined,
          },
        },
      };
    })
    .handle([apiAction.cancelled, apiAction.failed], (_state, { payload }) => {
      const id = payload?.id;
      const idStr = id == null ? '' : String(id);
      return {
        states: {
          [idStr]: {
            loading: false,
            error: payload?.error,
          },
        },
      };
    })
    .build();
}

export function createEpic<S, T, I, P, E = any>(
  apiAction: ApiActionTypesRecord<Partial<StateWithId<T, I, P, E>>>,
  run: (id: I, params: P, state: StateObservable<S>) => ObservableInput<T>,
  additionalTrigger?: Epic<any, any, S>,
): Epic<any, any, S> {
  const types = mapObjIndexed(x => x().type, apiAction);
  return (action$, state$, dep) => {
    let from$;
    if (additionalTrigger) {
      const trigger$ = additionalTrigger(action$, state$, dep);
      from$ = combineLatest(trigger$, action$.pipe(ofType(types.requested))).pipe(map(([, act]) => act));
    } else {
      from$ = action$.pipe(ofType(types.requested));
    }
    return from$.pipe(
      ofType(types.requested),
      mergeMap(({ payload }) =>
        from(run(payload?.id, payload?.params, state$)).pipe(
          map(resp => apiAction.completed({ id: payload?.id, value: resp })),
          catchError((error: E) => of(apiAction.failed({ id: payload?.id, error }))),
          takeUntil(
            action$.pipe(
              ofType(types.cancelled),
              filter(action => action.payload && payload && action.payload.id === payload.id),
            ),
          ),
        ),
      ),
    );
  };
}
