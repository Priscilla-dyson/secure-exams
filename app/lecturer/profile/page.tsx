'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Mail, 
  Phone, 
  Building2, 
  IdCard,
  Save,
  Key,
  Moon,
  Globe,
  Smartphone,
  LogOut,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { SidebarLayout } from '@/components/sidebar-layout'

export default function ProfileSettingsPage() {
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [notificationsSaved, setNotificationsSaved] = useState(false)
  const [securitySaved, setSecuritySaved] = useState(false)

  const handleProfileSave = () => {
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handlePasswordSave = () => {
    setPasswordSaved(true)
    setTimeout(() => setPasswordSaved(false), 3000)
  }

  const handleNotificationsSave = () => {
    setNotificationsSaved(true)
    setTimeout(() => setNotificationsSaved(false), 3000)
  }

  const handleSecuritySave = () => {
    setSecuritySaved(true)
    setTimeout(() => setSecuritySaved(false), 3000)
  }

  return (
    <SidebarLayout userRole="lecturer">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profile & Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information, preferences, and security settings</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email address" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" placeholder="Enter your department" />
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input id="employeeId" placeholder="Your employee ID" readOnly />
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleProfileSave}>
                  <Save className="w-4 h-4 mr-2" />
                  {profileSaved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handlePasswordSave}>
                  <Key className="w-4 h-4 mr-2" />
                  {passwordSaved ? 'Password Updated!' : 'Update Password'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive exam reminders and student submissions via email</p>
                  </div>
                  <Switch id="emailNotifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="browserNotifications">Browser Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show desktop notifications for important events</p>
                  </div>
                  <Switch id="browserNotifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="examReminders">Exam Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified 24 hours before scheduled exams</p>
                  </div>
                  <Switch id="examReminders" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="submissionAlerts">Submission Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when students submit exam answers</p>
                  </div>
                  <Switch id="submissionAlerts" defaultChecked />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleNotificationsSave}>
                  <Bell className="w-4 h-4 mr-2" />
                  {notificationsSaved ? 'Preferences Saved!' : 'Save Preferences'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="twoFactorAuth" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sessionTimeout">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log out after period of inactivity</p>
                  </div>
                  <select id="sessionTimeout" className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="loginAlerts">Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                  </div>
                  <Switch id="loginAlerts" defaultChecked />
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mt-6">
                <h4 className="text-md font-semibold text-foreground mb-3">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No active sessions</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSecuritySave}>
                  <Shield className="w-4 h-4 mr-2" />
                  {securitySaved ? 'Security Updated!' : 'Update Security'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  )
}
