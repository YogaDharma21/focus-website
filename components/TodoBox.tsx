'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function TodoBox() {
  const [todos, setTodos] = useState<string[]>([])
  const [newTodo, setNewTodo] = useState('')

  const addTodo = () => {
    if (newTodo.trim() !== '') {
      setTodos([...todos, newTodo])
      setNewTodo('')
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            type="text"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="mr-2"
          />
          <Button onClick={addTodo}>Add</Button>
        </div>
        <ul>
          {todos.map((todo, index) => (
            <li key={index} className="flex items-center mb-2">
              <Checkbox id={`todo-${index}`} className="mr-2" />
              <label htmlFor={`todo-${index}`}>{todo}</label>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

