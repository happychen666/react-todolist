import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
// , PureComponent, memo, useState, useMemo, useCallback
import './App.css';

let idSeq = Date.now();
const LS_KEY = '_$_todos_';

function Control(props) {
  const { addTodo } = props;
  const inputRef = useRef();

  //onSubmit并没有传到子组件中，所以不需要useCallback包裹
  const onSubmit = (e) => {
    e.preventDefault();//阻止默认提交
    const newTodo = inputRef.current.value.trim();
    if (newTodo.length === 0) {
      return;
    }
    addTodo({
      id: ++idSeq,
      text: newTodo,
      complete: false
    });

    inputRef.current.value = '';
  }
  return (
    <div className="control">
      <h1>todos</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          ref={inputRef}
          className="new-todo"
          placeholder="Enter todo item"
        />
      </form>
    </div>
  )
}

function TodoItem(props) {
  const {
    todo,
    todo: {
      id,
      text,
      complete
    },
    removeTodo,
    toggleTodo
  } = props;
  const onChange = () => {
    toggleTodo(id)
  }
  const onRemove = () => {
    removeTodo(id);
  }

  return (
    <li className="todo-item">
      <input
        type="checkbox"
        onChange={onChange}
        checked={complete}
      />
      <label className={complete ? 'complete' : ''}>{text}</label>
      <button onClick={onRemove}>&#xd7;</button>
    </li>
  )
}

function Todos(props) {
  const {
    todos,
    removeTodo,
    toggleTodo
  } = props;
  return (
    <div>
      <ul>
        {
          todos.map(todo => {
            return (
              <TodoItem
                key={todo.id}
                todo={todo}
                removeTodo={removeTodo}
                toggleTodo={toggleTodo}
              />
            )
          })
        }
      </ul>
    </div>
  )
}

function App(props) {

  const [todos, setTodos] = useState([]);

  //由于addTodo，removeTodo，toggleTodo都要传给子组件，
  //所以就用useCallback将它们包裹起来来优化代码，避免子组件的不必要重渲染
  //setState是不需要放在useCallback函数中的依赖数组里的

  const addTodo = useCallback((todo) => {
    setTodos(todos => [...todos, todo])
  })

  const removeTodo = useCallback((id) => {
    setTodos(todos => todos.filter(item => {
      return item.id !== id;
    }))
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos(todos => todos.map(item => {
      return item.id === id
        ? {
          ...item,
          complete: !item.complete
        }
        : item;
    }))
  }, [])

  //将数据保存到localStorage中保证页面刷新数据依然存在

  //获取localStorage中的数据，这个副作用在程序启动是只执行一次即可，所以传入空数组
  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem(LS_KEY)) || [];
    setTodos(todos);
  },[])
  //将数据写到localStorage中，todos变量时副作用的依赖，只要todos发生变化就写数据
  useEffect(() => {
    localStorage.setItem(LS_KEY,JSON.stringify(todos));
  },[todos])

  return (
    <div className="todo-list">
      <Control addTodo={addTodo} />
      <Todos
        todos={todos}
        removeTodo={removeTodo}
        toggleTodo={toggleTodo} />
    </div>
  )
}

export default App;