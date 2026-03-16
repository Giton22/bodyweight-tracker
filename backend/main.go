package main

import (
	"log"

	"slimrr/pb"
)

func main() {
	if err := pb.Start(); err != nil {
		log.Fatal(err)
	}
}
