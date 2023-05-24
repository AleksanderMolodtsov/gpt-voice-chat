build:
	docker build -t psp .

run:
	docker run -p 3000:3000 --name psp --rm psp