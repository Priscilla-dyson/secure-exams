import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorize, unauthorizedResponse } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await authorize(request, ['LECTURER'])
    if (!user) return unauthorizedResponse()

    // Check if user is HOD using the isHod flag (which comes from hodDepartment relation)
    if (!user.isHod || !user.departmentId) {
      return NextResponse.json({ error: 'Not authorized as HOD. Only department HODs can view department data.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    const departmentId = user.departmentId

    // Get the department info
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        programs: { where: { isActive: true }, select: { id: true, name: true } },
        _count: { select: { lecturers: true, subjects: true, programs: true } }
      }
    })

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    const programIds = department.programs.map(p => p.id)

    if (type === 'overview') {
      const studentsCount = programIds.length > 0 ? await prisma.user.count({
        where: { role: 'STUDENT', programId: { in: programIds }, status: 'active' }
      }) : 0

      const modulesCount = programIds.length > 0 ? await prisma.module.count({
        where: { programId: { in: programIds } }
      }) : 0

      const examsCount = programIds.length > 0 ? await prisma.exam.count({
        where: { module: { programId: { in: programIds } } }
      }) : 0

      // Get recent activity
      const recentExams = await prisma.exam.findMany({
        where: { module: { programId: { in: programIds } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          createdAt: true,
          module: { select: { code: true, name: true } },
          creator: { select: { name: true } },
          _count: { select: { examAttempts: true } }
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: department.id,
          name: department.name,
          code: department.code,
          description: department.description,
          lecturers: department._count.lecturers,
          students: studentsCount,
          modules: modulesCount,
          exams: examsCount,
          programs: department.programs.length,
          recentExams
        }
      })
    }

    if (type === 'lecturers') {
      const lecturers = await prisma.user.findMany({
        where: { role: 'LECTURER', departmentId },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          employeeId: true,
          status: true,
          hodDepartment: { select: { id: true } },
          lecturedModules: {
            select: {
              id: true,
              code: true,
              name: true,
              program: { select: { name: true } },
              class: { select: { name: true } }
            }
          }
        },
        orderBy: { name: 'asc' }
      })

      // Tag HODs
      const lecturersWithHodStatus = lecturers.map(l => ({
        ...l,
        isHod: l.hodDepartment !== null
      }))

      return NextResponse.json({ success: true, data: lecturersWithHodStatus })
    }

    if (type === 'modules') {
      const modules = programIds.length > 0 ? await prisma.module.findMany({
        where: { programId: { in: programIds } },
        select: {
          id: true,
          code: true,
          name: true,
          class: { select: { name: true, year: true } },
          lecturer: { select: { name: true, email: true } },
          program: { select: { name: true } },
          _count: { select: { exams: true } }
        },
        orderBy: { code: 'asc' }
      }) : []

      return NextResponse.json({ success: true, data: modules })
    }

    if (type === 'exams') {
      const exams = programIds.length > 0 ? await prisma.exam.findMany({
        where: { module: { programId: { in: programIds } } },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          duration: true,
          totalMarks: true,
          scheduledDate: true,
          module: {
            select: {
              code: true,
              name: true,
              lecturer: { select: { name: true } },
              program: { select: { name: true } }
            }
          },
          creator: { select: { name: true } },
          _count: { select: { examAttempts: true } }
        },
        orderBy: { createdAt: 'desc' }
      }) : []

      return NextResponse.json({ success: true, data: exams })
    }

    if (type === 'results') {
      const results = programIds.length > 0 ? await prisma.result.findMany({
        where: { exam: { module: { programId: { in: programIds } } }, published: true },
        select: {
          id: true,
          score: true,
          totalMarks: true,
          percentage: true,
          grade: true,
          createdAt: true,
          student: { select: { name: true, userId: true, registrationNumber: true } },
          exam: {
            select: {
              title: true,
              type: true,
              module: { select: { code: true, name: true, program: { select: { name: true } } } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }) : []

      // Calculate stats
      const totalResults = results.length
      const avgPercentage = totalResults > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalResults) 
        : 0
      const passed = results.filter(r => r.percentage >= 50).length
      const failed = results.filter(r => r.percentage < 50).length

      return NextResponse.json({ 
        success: true, 
        data: results,
        stats: { totalResults, avgPercentage, passed, failed }
      })
    }

    if (type === 'activities') {
      // Comprehensive view of all activities in the department
      // Get all exams with their statuses, creators, attempt counts
      const allExams = programIds.length > 0 ? await prisma.exam.findMany({
        where: { module: { programId: { in: programIds } } },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          duration: true,
          totalMarks: true,
          scheduledDate: true,
          endDate: true,
          createdAt: true,
          published: true,
          module: {
            select: {
              code: true,
              name: true,
              class: { select: { name: true } },
              program: { select: { name: true } }
            }
          },
          creator: { select: { name: true, userId: true } },
          _count: {
            select: {
              examAttempts: true,
              questions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      }) : []

      // Get pending grading count (SUBMITTED attempts that aren't graded)
      const pendingGrading = programIds.length > 0 ? await prisma.examAttempt.count({
        where: {
          status: 'SUBMITTED',
          exam: { module: { programId: { in: programIds } } }
        }
      }) : 0

      // Get total active students
      const activeStudents = programIds.length > 0 ? await prisma.user.count({
        where: { role: 'STUDENT', programId: { in: programIds }, status: 'active' }
      }) : 0

      return NextResponse.json({
        success: true,
        data: {
          department: department.name,
          departmentCode: department.code,
          activities: {
            totalExams: allExams.length,
            draftExams: allExams.filter(e => e.status === 'DRAFT').length,
            activeExams: allExams.filter(e => e.status === 'ACTIVE' || e.status === 'SCHEDULED').length,
            completedExams: allExams.filter(e => e.status === 'COMPLETED').length,
            pendingGrading,
            activeStudents,
            totalQuestions: allExams.reduce((sum, e) => sum + e._count.questions, 0),
          },
          exams: allExams
        }
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter. Use: overview, lecturers, modules, exams, results, activities' }, { status: 400 })

  } catch (error) {
    console.error('Department API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}