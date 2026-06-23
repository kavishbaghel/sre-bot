package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"

	ollama "github.com/ollama/ollama/api"
)

type ChatHandler struct {
	db       *DB
	llmHost  string
	llmModel string
}

func NewChatHandler(db *DB, llmHost, llmModel string) *ChatHandler {
	return &ChatHandler{
		db:       db,
		llmHost:  llmHost,
		llmModel: llmModel,
	}
}

func (ch *ChatHandler) BuildSystemPrompt(ctx context.Context) string {
	healthStatus, err := ch.db.GetHealthStatus(ctx)
	if err != nil {
		log.Printf("Could not fetch health status - %v", err)
		return ""
	}
	healthStatusInfo, err := json.Marshal(healthStatus)
	if err != nil {
		log.Printf("Could not convert health status data to json - %v", err)
		return ""
	}

	failureSummary, err := ch.db.GetFailureSummary(ctx, 30)
	if err != nil {
		log.Printf("Could not fetch failure summary - %v", err)
		return ""
	}
	failureSummaryInfo, err := json.Marshal(failureSummary)
	if err != nil {
		log.Printf("Could not convert failure summary to json - %v", err)
		return ""
	}

	systemPrompt := fmt.Sprintf(`
	You are sre-bot, an AI-powered SRE assistant.

	Current system health:
	%v

	Recent failure summary (last 30 minutes):
	%v

	Answer questions about system health, incidents, and infrastructure clearly and concisely.
	`, healthStatusInfo, failureSummaryInfo)

	return systemPrompt
}

func (ch *ChatHandler) Chat(ctx context.Context, userMessage string) (string, error) {
	prompt := ch.BuildSystemPrompt(ctx)
	host, err := url.Parse(ch.llmHost)
	if err != nil {
		log.Printf("Could not parse url - %v", err)
		return "", err
	}

	llmClient := ollama.NewClient(
		host,
		http.DefaultClient,
	)
	// finalPrompt := fmt.Sprintf("%s\n\nUser: %s", prompt, userMessage)
	var req = &ollama.GenerateRequest{
		Model:  ch.llmModel,
		Prompt: userMessage,
		System: prompt,
	}
	var responseText string
	respFunc := func(r ollama.GenerateResponse) error {
		responseText += r.Response // accumulate each token
		return nil
	}
	err = llmClient.Generate(ctx, req, respFunc)
	if err != nil {
		log.Printf("Error occurred while generating response - %v", err)
		return "", err
	}
	return responseText, nil

}
