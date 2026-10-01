package task

import (
	"context"
	"errors"
	"fmt"
	"strings"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context, f TaskFilter) ([]Task, error) {
	return s.repo.List(ctx, f)
}

func (s *Service) GetByID(ctx context.Context, id string) (*Task, error) {
	if strings.TrimSpace(id) == "" {
		return nil, errors.New("id is required")
	}
	t, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, errors.New("task not found")
	}
	return t, nil
}

func (s *Service) Create(ctx context.Context, req CreateTaskRequest) (*Task, error) {
	if strings.TrimSpace(req.Title) == "" {
		return nil, errors.New("title is required")
	}

	statusInput := req.StatusID
	if statusInput == "" {
		statusInput = req.Status
	}
	statusID, statusName, _, err := s.repo.ResolveStatus(ctx, statusInput)
	if err != nil {
		return nil, fmt.Errorf("resolve status: %w", err)
	}

	priorityInput := req.PriorityID
	if priorityInput == "" {
		priorityInput = req.Priority
	}
	priorityID, priorityName, err := s.repo.ResolvePriority(ctx, priorityInput)
	if err != nil {
		return nil, fmt.Errorf("resolve priority: %w", err)
	}

	categoryInput := req.CategoryID
	if categoryInput == "" {
		categoryInput = req.Category
	}
	categoryID, categoryName, err := s.repo.ResolveCategory(ctx, categoryInput)
	if err != nil {
		return nil, fmt.Errorf("resolve category: %w", err)
	}

	var assignedToID *string
	userInput := req.AssignedTo
	if userInput == nil || *userInput == "" {
		if req.Assignee != "" {
			userInput = &req.Assignee
		}
	}
	if userInput != nil && *userInput != "" {
		uID, _, uErr := s.repo.ResolveUser(ctx, *userInput)
		if uErr == nil && uID != "" {
			assignedToID = &uID
		}
	}

	t := &Task{
		Title:       strings.TrimSpace(req.Title),
		Description: strings.TrimSpace(req.Description),
		StatusID:    statusID,
		Status:      statusName,
		PriorityID:  priorityID,
		Priority:    priorityName,
		CategoryID:  categoryID,
		Category:    categoryName,
		AssignedTo:  assignedToID,
		DueDate:      req.DueDate,
		CustomFields: req.CustomFields,
	}

	newID, err := s.repo.Create(ctx, t)
	if err != nil {
		return nil, err
	}
	t.ID = newID

	// Create initial checklists if provided
	for _, text := range req.Checklists {
		if strings.TrimSpace(text) != "" {
			_, _ = s.repo.AddChecklist(ctx, newID, strings.TrimSpace(text))
		}
	}

	// Record audit activity log (PDF Page 7)
	_ = s.repo.AddActivityLog(ctx, newID, "CREATED", fmt.Sprintf("Task '%s' created", t.Title), nil)

	return s.repo.GetByID(ctx, newID)
}

func (s *Service) Update(ctx context.Context, id string, req UpdateTaskRequest) (*Task, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil || existing == nil {
		return nil, errors.New("task not found")
	}

	if req.Title != nil && strings.TrimSpace(*req.Title) != "" {
		existing.Title = strings.TrimSpace(*req.Title)
	}
	if req.Description != nil {
		existing.Description = strings.TrimSpace(*req.Description)
	}

	// Status update
	statusVal := ""
	if req.StatusID != nil && *req.StatusID != "" {
		statusVal = *req.StatusID
	} else if req.Status != nil && *req.Status != "" {
		statusVal = *req.Status
	}
	if statusVal != "" {
		stID, stName, isTerm, sErr := s.repo.ResolveStatus(ctx, statusVal)
		if sErr == nil {
			existing.StatusID = stID
			existing.Status = stName
			_ = s.repo.UpdateStatus(ctx, id, stID, isTerm)
		}
	}

	// Priority update
	priVal := ""
	if req.PriorityID != nil && *req.PriorityID != "" {
		priVal = *req.PriorityID
	} else if req.Priority != nil && *req.Priority != "" {
		priVal = *req.Priority
	}
	if priVal != "" {
		pID, pName, pErr := s.repo.ResolvePriority(ctx, priVal)
		if pErr == nil {
			existing.PriorityID = pID
			existing.Priority = pName
		}
	}

	// Category update
	catVal := ""
	if req.CategoryID != nil && *req.CategoryID != "" {
		catVal = *req.CategoryID
	} else if req.Category != nil && *req.Category != "" {
		catVal = *req.Category
	}
	if catVal != "" {
		cID, cName, cErr := s.repo.ResolveCategory(ctx, catVal)
		if cErr == nil {
			existing.CategoryID = cID
			existing.Category = cName
		}
	}

	if req.DueDate != nil {
		existing.DueDate = req.DueDate
	}
	if req.CustomFields != nil {
		existing.CustomFields = req.CustomFields
	}

	if err := s.repo.Update(ctx, id, existing); err != nil {
		return nil, err
	}

	_ = s.repo.AddActivityLog(ctx, id, "UPDATED", "Task details updated", nil)

	return s.repo.GetByID(ctx, id)
}

func (s *Service) Delete(ctx context.Context, id string) error {
	err := s.repo.Delete(ctx, id)
	if err == nil {
		_ = s.repo.AddActivityLog(ctx, id, "ARCHIVED", "Task archived", nil)
	}
	return err
}

func (s *Service) UpdateStatus(ctx context.Context, id, statusVal string) (*Task, error) {
	stID, stName, isTerm, err := s.repo.ResolveStatus(ctx, statusVal)
	if err != nil {
		return nil, fmt.Errorf("resolve status: %w", err)
	}

	if err := s.repo.UpdateStatus(ctx, id, stID, isTerm); err != nil {
		return nil, err
	}

	_ = s.repo.AddActivityLog(ctx, id, "STATUS_CHANGED", fmt.Sprintf("Status changed to %s", stName), nil)

	return s.repo.GetByID(ctx, id)
}

func (s *Service) UpdatePriority(ctx context.Context, id, priorityVal string) (*Task, error) {
	pID, pName, err := s.repo.ResolvePriority(ctx, priorityVal)
	if err != nil {
		return nil, fmt.Errorf("resolve priority: %w", err)
	}

	if err := s.repo.UpdatePriority(ctx, id, pID); err != nil {
		return nil, err
	}

	_ = s.repo.AddActivityLog(ctx, id, "PRIORITY_CHANGED", fmt.Sprintf("Priority changed to %s", pName), nil)

	return s.repo.GetByID(ctx, id)
}

func (s *Service) UpdateCategory(ctx context.Context, id, categoryVal string) (*Task, error) {
	cID, cName, err := s.repo.ResolveCategory(ctx, categoryVal)
	if err != nil {
		return nil, fmt.Errorf("resolve category: %w", err)
	}

	if err := s.repo.UpdateCategory(ctx, id, cID); err != nil {
		return nil, err
	}

	_ = s.repo.AddActivityLog(ctx, id, "CATEGORY_CHANGED", fmt.Sprintf("Category changed to %s", cName), nil)

	return s.repo.GetByID(ctx, id)
}

func (s *Service) UpdateDueDate(ctx context.Context, id string, dueDate *string) (*Task, error) {
	if err := s.repo.UpdateDueDate(ctx, id, dueDate); err != nil {
		return nil, err
	}
	detail := "Due date cleared"
	if dueDate != nil && *dueDate != "" {
		detail = fmt.Sprintf("Due date set to %s", *dueDate)
	}
	_ = s.repo.AddActivityLog(ctx, id, "DUE_DATE_CHANGED", detail, nil)
	return s.repo.GetByID(ctx, id)
}

func (s *Service) BulkAction(ctx context.Context, req BulkActionRequest) error {
	if len(req.TaskIDs) == 0 {
		return errors.New("no task ids provided")
	}

	switch req.Action {
	case "update_status":
		statusVal := req.StatusID
		if statusVal == "" {
			statusVal = req.Status
		}
		stID, _, isTerm, err := s.repo.ResolveStatus(ctx, statusVal)
		if err != nil {
			return err
		}
		return s.repo.BulkUpdateStatus(ctx, req.TaskIDs, stID, isTerm)

	case "update_priority":
		priVal := req.PriorityID
		if priVal == "" {
			priVal = req.Priority
		}
		pID, _, err := s.repo.ResolvePriority(ctx, priVal)
		if err != nil {
			return err
		}
		return s.repo.BulkUpdatePriority(ctx, req.TaskIDs, pID)

	case "update_category":
		catVal := req.CategoryID
		if catVal == "" {
			catVal = req.Category
		}
		cID, _, err := s.repo.ResolveCategory(ctx, catVal)
		if err != nil {
			return err
		}
		return s.repo.BulkUpdateCategory(ctx, req.TaskIDs, cID)

	case "archive", "delete":
		return s.repo.BulkArchive(ctx, req.TaskIDs)

	default:
		return fmt.Errorf("unsupported bulk action: %s", req.Action)
	}
}

// Checklist delegation
func (s *Service) AddChecklist(ctx context.Context, taskID, text string) (*ChecklistItem, error) {
	if strings.TrimSpace(text) == "" {
		return nil, errors.New("text is required")
	}
	item, err := s.repo.AddChecklist(ctx, taskID, strings.TrimSpace(text))
	if err == nil {
		_ = s.repo.AddActivityLog(ctx, taskID, "CHECKLIST_ADDED", fmt.Sprintf("Added step '%s'", text), nil)
	}
	return item, err
}

func (s *Service) ToggleChecklist(ctx context.Context, id string) (*ChecklistItem, error) {
	item, err := s.repo.ToggleChecklist(ctx, id)
	if err == nil && item != nil {
		action := "reopened"
		if item.Done {
			action = "completed"
		}
		_ = s.repo.AddActivityLog(ctx, item.TaskID, "CHECKLIST_UPDATED", fmt.Sprintf("Step '%s' %s", item.Text, action), nil)
	}
	return item, err
}

func (s *Service) DeleteChecklist(ctx context.Context, id string) error {
	return s.repo.DeleteChecklist(ctx, id)
}

// Comment delegation
func (s *Service) ListComments(ctx context.Context, taskID string) ([]TaskComment, error) {
	return s.repo.ListComments(ctx, taskID)
}

func (s *Service) AddComment(ctx context.Context, taskID, text string, userID *string) (*TaskComment, error) {
	if strings.TrimSpace(text) == "" {
		return nil, errors.New("comment text is required")
	}
	comment, err := s.repo.AddComment(ctx, taskID, strings.TrimSpace(text), userID)
	if err == nil {
		_ = s.repo.AddActivityLog(ctx, taskID, "COMMENT_ADDED", "Added a team comment", userID)
	}
	return comment, err
}

// Attachment delegation
func (s *Service) ListAttachments(ctx context.Context, taskID string) ([]TaskAttachment, error) {
	return s.repo.ListAttachments(ctx, taskID)
}

func (s *Service) AddAttachment(ctx context.Context, taskID, name, mimeType string, sizeBytes int64) (*TaskAttachment, error) {
	att, err := s.repo.AddAttachment(ctx, taskID, name, mimeType, sizeBytes)
	if err == nil {
		_ = s.repo.AddActivityLog(ctx, taskID, "ATTACHMENT_ADDED", fmt.Sprintf("Attached file '%s'", name), nil)
	}
	return att, err
}

func (s *Service) DeleteAttachment(ctx context.Context, id string) error {
	return s.repo.DeleteAttachment(ctx, id)
}

// Activity logs
func (s *Service) ListActivityLogs(ctx context.Context, taskID string) ([]ActivityLog, error) {
	return s.repo.ListActivityLogs(ctx, taskID)
}
