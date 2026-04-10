'use client'

import { DotsThree, Pencil, Trash, User } from '@phosphor-icons/react'

import { Button } from '@/ui/button'
import { Card } from '@/ui/card'
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from '@/ui/menu'

export default function MenuPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Menu</h1>
        <p className="mt-2 text-foreground-muted">Dropdown menu with items and separators</p>
      </div>

      <Card className="p-6">
        <div className="flex gap-8">
          <Menu>
            <MenuTrigger>
              <Button variant="secondary">
                <DotsThree size={18} weight="bold" />
                Actions
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuLabel>Options</MenuLabel>
              <MenuItem>
                <Pencil size={16} />
                Edit
              </MenuItem>
              <MenuItem>
                <User size={16} />
                View Profile
              </MenuItem>
              <MenuSeparator />
              <MenuItem>
                <Trash size={16} />
                Delete
              </MenuItem>
            </MenuContent>
          </Menu>

          <Menu>
            <MenuTrigger>
              <Button variant="ghost">Right Aligned Menu</Button>
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem>Settings</MenuItem>
              <MenuItem>Preferences</MenuItem>
              <MenuItem>Help</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </Card>
    </div>
  )
}
